import React from 'react'
import shortid from 'shortid'
import FallbackImageUploader from '../../../fallback-image-uploader'

export default ({
  name,
  onChange,
  value,
  fieldProperties = {
    width: 200,
    height: 200,
    directoryName: 'untitled',
    fallbackFieldName: '',
    prefixWithHash: true
  },
  setFieldsValues
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
          if (fieldProperties.fallbackFieldName) {
            setFieldsValues({
              [name]: url,
              [fieldProperties.fallbackFieldName]: fallbackUrl
            })
          } else if (onChange) {
            onChange(url)
          }
        }}
        requiredWidth={fieldProperties.width}
        requiredHeight={fieldProperties.height}
        directoryPath={fieldProperties.directoryName}
        filePrefix={
          fieldProperties.prefixWithHash !== false ? shortid.generate() : ''
        }
      />
    </>
  )
}
