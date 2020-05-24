import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import Button from '../button'
import useFileUpload from '../../hooks/useFileUpload'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  }
})

function Output({ onUploaded, directoryPath = '', filePrefix = '' }) {
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)
  const [imageSrc, setImageSrc] = useState(null)
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const imageRef = useRef()
  const selectedFileRef = useRef()

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

  const onSubmitBtnClick = async () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 300
      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        imageRef.current,
        cropX,
        cropY,
        width,
        height,
        0,
        0,
        300,
        300
      )

      canvas.toBlob(async blob => {
        const filename = `${filePrefix ? `${filePrefix}___` : ''}${
          selectedFileRef.current.name
        }`
        const fileToUpload = new File([blob], filename)

        const uploadedUrl = await upload(
          fileToUpload,
          `${directoryPath}/${filename}`
        )

        setUploadedUrl(uploadedUrl)
        onUploaded(uploadedUrl)
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (uploadedUrl) {
    return (
      <>
        <img
          src={uploadedUrl}
          width="300"
          height="300"
          alt="Uploaded preview"
        />
        <Button onClick={onCancelBtnClick} color="default">
          Delete
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
        <p>Please follow this guide for a good thumbnail:</p>
        <ul>
          <li>300px by 300px (an option to crop will appear)</li>
          <li>file type PNG</li>
        </ul>
        <input
          type="file"
          onChange={event => onFileChange(event.target.files)}
          accept="image/png"
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
          width,
          height,
          aspect: 1,
          locked: true,
          unit: 'px'
        }}
      />
      <Button onClick={onCancelBtnClick} color="default">
        Cancel
      </Button>
      <Button onClick={onSubmitBtnClick}>Submit</Button>
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
