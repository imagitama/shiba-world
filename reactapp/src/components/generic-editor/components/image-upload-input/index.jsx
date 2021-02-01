import React from 'react'
import shortid from 'shortid'
import OptimizedImageUploader from '../../../optimized-image-uploader'
import { fixAccessingImagesUsingToken } from '../../../../utils'
import Button from '../../../button'

export default ({
  onChange,
  value,
  fieldProperties = {
    width: 200,
    height: 200,
    directoryName: 'untitled',
    prefixWithHash: true
  }
}) => {
  return (
    <>
      {value && (
        <div>
          <img
            src={fixAccessingImagesUsingToken(value)}
            alt="Preview"
            width={fieldProperties.width}
            height={fieldProperties.height}
          />
          <Button color="default" onClick={() => onChange(null)}>
            Clear
          </Button>
        </div>
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
