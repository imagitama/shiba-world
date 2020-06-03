import React, { useRef } from 'react'
import { DropzoneArea } from 'material-ui-dropzone'
import useFileUpload from '../../hooks/useFileUpload'
import Button from '../button'

export default ({ directoryPath = '', filePrefix = '', onDownloadUrl }) => {
  const uploadedFileRef = useRef()
  const [isUploading, percentageDone, , , upload] = useFileUpload()

  const onDropzoneAreaChange = files => {
    uploadedFileRef.current = files[0]
  }

  const onUploadClick = async () => {
    if (!uploadedFileRef.current) {
      console.error('No file selected!!!')
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
      <DropzoneArea
        onChange={onDropzoneAreaChange}
        filesLimit={1}
        maxFileSize={500 * 1000 * 1000} // 500mb
      />
      Upload images (jpg, png, etc.) and ZIP files. Max 500mb. RAR, FBX and
      unitypackage not supported (use ZIP)
      <br />
      <strong>
        Please wait a few seconds after the file is uploaded for it to appear in
        the list above.
      </strong>
      <br />
      <Button onClick={onUploadClick}>Upload</Button>
    </>
  )
}
