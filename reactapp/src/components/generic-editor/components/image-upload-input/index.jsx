import React from 'react'
import shortid from 'shortid'
import OptimizedImageUploader from '../../../optimized-image-uploader'
import { fixAccessingImagesUsingToken } from '../../../../utils'

export default ({
  name,
  onChange,
  value,
  fieldProperties = {
    width: 200,
    height: 200,
    directoryName: 'untitled',
    prefixWithHash: true
  },
  setFieldsValues
}) => {
  return (
    <>
      {value && (
        <img
          src={fixAccessingImagesUsingToken(value)}
          alt="Preview"
          width={fieldProperties.width}
          height={fieldProperties.height}
        />
      )}
      <OptimizedImageUploader
        onUploadedUrl={url => {
          if (onChange) {
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
