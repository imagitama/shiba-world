import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Button from '../button'
import useFileUpload from '../../hooks/useFileUpload'
import BodyText from '../body-text'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  }
})

function renameJpgToPng(path) {
  return path.replace('.jpeg', '.png').replace('.jpg', '.png')
}

function Output({
  onUploadedUrls,
  requiredWidth = THUMBNAIL_WIDTH,
  requiredHeight = THUMBNAIL_HEIGHT,
  directoryPath = '',
  filePrefix = ''
}) {
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [imageSrc, setImageSrc] = useState(null)
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const imageRef = useRef()
  const selectedFileRef = useRef()
  const [croppedImagePreviewUrl, setCroppedImagePreviewUrl] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [isErrored, setIsErrored] = useState(false)

  useEffect(() => {
    if (!imageRef.current) {
      return
    }

    async function main() {
      try {
        const canvas = await cropImageElementAndGetCanvas()
        const url = canvas.toDataURL('image/jpeg')
        setCroppedImagePreviewUrl(url)
      } catch (err) {
        console.error('Failed to generate cropped image preview url', err)
        handleError(err)
      }
    }
    main()
  }, [cropX, cropY, width, height])

  const onFileChange = files => {
    const reader = new FileReader()
    const selectedFile = files[0]
    selectedFileRef.current = selectedFile

    reader.addEventListener('load', () => {
      setImageSrc(reader.result)
    })

    reader.readAsDataURL(selectedFile)
  }

  const onCancelBtnClick = () => {
    selectedFileRef.current = null
    setImageSrc(null)
    setUploadedUrl(null)
    setIsOptimizing(false)
    setIsErrored(false)
  }

  const cropImageElementAndGetCanvas = async () => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas')
      canvas.width = requiredWidth
      canvas.height = requiredHeight

      const image = imageRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        image,
        cropX * scaleX,
        cropY * scaleY,
        width * scaleX,
        height * scaleY,
        0,
        0,
        requiredWidth,
        requiredHeight
      )
      resolve(canvas)
    })
  }

  const cropImageElementAndGetBlob = async (asJpeg = false) => {
    const canvas = await cropImageElementAndGetCanvas()

    return new Promise(resolve => {
      // PNG is way slower to use JPEG for previews
      if (asJpeg) {
        canvas.toBlob(resolve, 'image/jpeg', 1)
      } else {
        canvas.toBlob(resolve)
      }
    })
  }

  const onPerformCropBtnClick = async () => {
    try {
      const blob = await cropImageElementAndGetBlob()

      const filename = `${filePrefix ? `${filePrefix}___` : ''}${renameJpgToPng(
        selectedFileRef.current.name
      )}`
      const fileToUpload = new File([blob], filename)

      const uploadedUrl = await upload(
        fileToUpload,
        `${directoryPath}/${filename}`
      )

      setIsOptimizing(true)

      const {
        data: { optimizedImageUrl }
      } = await callFunction('optimizeImage', {
        imageUrl: uploadedUrl
      })

      setIsOptimizing(false)
      setUploadedUrl(optimizedImageUrl)

      onUploadedUrls({
        fallbackUrl: uploadedUrl,
        url: optimizedImageUrl
      })
    } catch (err) {
      console.error('Failed to crop image', err)
      handleError(err)
      setIsErrored(true)
    }
  }

  if (isErrored) {
    return (
      <>
        An error has occurred. Please try again
        <br />
        <Button onClick={onCancelBtnClick} color="default">
          Try Again
        </Button>
      </>
    )
  }

  if (isOptimizing) {
    return 'Optimizing image...'
  }

  if (uploadedUrl) {
    return (
      <>
        <img src={uploadedUrl} width="100%" alt="Uploaded preview" />
        <Button onClick={onCancelBtnClick} color="default">
          Try Again
        </Button>
      </>
    )
  }

  if (isUploading) {
    return `Uploading ${parseInt(percentageDone)}%...`
  }

  if (!imageSrc) {
    return (
      <>
        <BodyText>
          Select a JPG or PNG and you will be able to crop it to {requiredWidth}
          x{requiredHeight}
        </BodyText>
        <input
          type="file"
          onChange={event => onFileChange(event.target.files)}
          accept="image/png,image/jpeg"
        />
      </>
    )
  }

  return (
    <>
      Now crop the image:
      <ReactCrop
        src={imageSrc}
        onChange={newCrop => {
          // If you store the whole object it invalidates a dep and causes infinite loop
          setCropX(newCrop.x)
          setCropY(newCrop.y)
          setWidth(newCrop.width)
          setHeight(newCrop.height)
        }}
        onImageLoaded={img => {
          imageRef.current = img
        }}
        style={{ width: '100%' }}
        crop={{
          x: cropX,
          y: cropY,
          width: width ? width : undefined,
          height: height ? height : 100,
          lock: true,
          aspect: requiredWidth / requiredHeight,
          unit: width && height ? 'px' : '%'
        }}
      />
      Output:
      <img
        src={croppedImagePreviewUrl}
        width={requiredWidth}
        height={requiredHeight}
        alt="Uploaded preview"
      />
      <br />
      <Button onClick={onCancelBtnClick} color="default">
        Cancel
      </Button>
      <Button onClick={onPerformCropBtnClick}>Submit</Button>
    </>
  )
}

export default props => {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <Output {...props} />
    </Paper>
  )
}
