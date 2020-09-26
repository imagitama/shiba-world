import React from 'react'
import FallbackImageUploader from '../../../fallback-image-uploader'

export default ({
  onChange,
  value,
  fieldProperties = {
    width: 200,
    height: 200,
    directoryName: 'untitled',
    fallbackFieldName: ''
  },
  setFieldValue
}) => {
  return (
    <>
      {value && (
        <img
          src={value}
          alt="Preview"
          width={fieldProperties.width}
          height={fieldProperties.height}
        />
      )}
      <FallbackImageUploader
        onUploadedUrls={({ url, fallbackUrl }) => {
          onChange(url)
          if (fieldProperties.fallbackFieldName) {
            console.log('setting it', fallbackUrl)
            setFieldValue(fieldProperties.fallbackFieldName, fallbackUrl)
          }
        }}
        requiredWidth={fieldProperties.width}
        requiredHeight={fieldProperties.height}
        directoryPath={fieldProperties.directoryName}
      />
    </>
  )
}
