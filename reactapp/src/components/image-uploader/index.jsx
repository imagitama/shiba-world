import React, { useState, useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Button from '../button'
import useFileUpload from '../../hooks/useFileUpload'
import BodyText from '../body-text'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  container: {
    position: 'relative'
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    zIndex: 100
  }
})

function renameJpgToPng(path) {
  return path.replace('.jpeg', '.png').replace('.jpg', '.png')
}

export default ({
  onDownloadUrl,
  onCroppedImagePreviewUrl = null,
  directoryPath = '',
  filePrefix = '',
  thumbnailWidthAndHeight = 300,
  children
}) => {
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [imageSrc, setImageSrc] = useState(null)
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const imageRef = useRef()
  const selectedFileRef = useRef()
  const classes = useStyles()

  useEffect(() => {
    if (!imageRef.current) {
      return
    }

    async function main() {
      try {
        const canvas = await cropImageElementAndGetCanvas()
        const url = canvas.toDataURL('image/jpeg')
        if (onCroppedImagePreviewUrl) {
          onCroppedImagePreviewUrl(url)
        }
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
  }

  const cropImageElementAndGetCanvas = async () => {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas')
      canvas.width = thumbnailWidthAndHeight
      canvas.height = thumbnailWidthAndHeight

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
        thumbnailWidthAndHeight,
        thumbnailWidthAndHeight
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

      setUploadedUrl(uploadedUrl)
      onDownloadUrl(uploadedUrl)
    } catch (err) {
      console.error('Failed to crop image', err)
      handleError(err)
    }
  }

  if (uploadedUrl) {
    return (
      <>
        <img
          src={uploadedUrl}
          width={thumbnailWidthAndHeight}
          height={thumbnailWidthAndHeight}
          alt="Uploaded preview"
        />
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
    if (children) {
      return (
        <div className={classes.container}>
          <input
            className={classes.input}
            type="file"
            onChange={event => onFileChange(event.target.files)}
            multiple={false}
          />
          {children}
        </div>
      )
    }

    return (
      <>
        <BodyText>
          Select a JPG or PNG and you will be able to crop it to{' '}
          {thumbnailWidthAndHeight}x{thumbnailWidthAndHeight}
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
          aspect: 1,
          lock: true,
          unit: width && height ? 'px' : '%'
        }}
      />
      <br />
      <Button onClick={onCancelBtnClick} color="default">
        Cancel
      </Button>
      <Button onClick={onPerformCropBtnClick}>Submit</Button>
    </>
  )
}
