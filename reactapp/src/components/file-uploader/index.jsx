import React, { useRef } from 'react'
import useFileUpload from '../../hooks/useFileUpload'
import Button from '../button'

export default ({ directoryPath = '', filePrefix = '', onDownloadUrl }) => {
  const uploadedFileRef = useRef()
  const [isUploading, percentageDone, , , upload] = useFileUpload()

  const onFileChange = files => {
    uploadedFileRef.current = files[0]
  }

  const onUploadClick = async () => {
    if (!uploadedFileRef.current) {
      console.warn('You clicked upload but there were no files selected')
      return
    }

    try {
      const url = await upload(
        uploadedFileRef.current,
        `${directoryPath}/${filePrefix ? `${filePrefix}___` : ''}${
          uploadedFileRef.current.name
        }`
      )

      onDownloadUrl(url)
    } catch (err) {
      console.error(err)
    }
  }

  if (isUploading || (percentageDone > 0 && percentageDone < 100)) {
    return `Uploading ${parseInt(percentageDone)}%`
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
