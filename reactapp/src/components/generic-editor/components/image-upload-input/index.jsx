import React from 'react'
import ImageUploader from '../../../image-uploader'
import Avatar from '../../../avatar'

export default ({ onChange, value, extraFormData = {} }) => {
  return (
    <>
      <ImageUploader
        onDownloadUrl={onChange}
        directoryPath={`avatars/${extraFormData.userId}`}
        thumbnailWidthAndHeight={200}
      />
      {value ? <Avatar url={value} /> : '(none set)'}
    </>
  )
}
