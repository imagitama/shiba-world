import React, { useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useFileUpload from '../../hooks/useFileUpload'
import Button from '../button'
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

export default ({
  onDownloadUrl,
  directoryPath = '',
  filePrefix = '',
  children
}) => {
  const uploadedFileRef = useRef()
  const [isUploading, percentageDone, , , upload] = useFileUpload()
  const classes = useStyles()

  const onFileChange = files => {
    uploadedFileRef.current = files[0]

    if (children) {
      onUploadClick()
    }
  }

  const onUploadClick = async () => {
    if (!uploadedFileRef.current) {
      console.warn('You clicked upload but there were no files selected')
      return
    }

    try {
      const pathToUpload = `${directoryPath}/${
        filePrefix ? `${filePrefix}___` : ''
      }${uploadedFileRef.current.name}`

      console.debug(`Uploading file "${pathToUpload}"`)

      const url = await upload(uploadedFileRef.current, pathToUpload)

      onDownloadUrl(url)
    } catch (err) {
      console.error('Failed to upload file', err)
      handleError(err)
    }
  }

  if (isUploading || (percentageDone > 0 && percentageDone < 100)) {
    return `Uploading ${parseInt(percentageDone)}%`
  }

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
      <input
        type="file"
        onChange={event => onFileChange(event.target.files)}
        multiple={false}
      />
      <Button onClick={onUploadClick}>Upload</Button>
    </>
  )
}
