import React, { useRef, useEffect } from 'react'
import shortid from 'shortid'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import OptimizedImageUploader from '../optimized-image-uploader'

import { createRef } from '../../utils'
import { handleError } from '../../error-handling'

export default ({ assetId, onDone }) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const timeoutRef = useRef()

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to save thumbnail</ErrorMessage>
  }

  if (isSuccess) {
    return <SuccessMessage>Thumbnail has been changed!</SuccessMessage>
  }

  const onUploaded = async url => {
    try {
      await save({
        [AssetFieldNames.thumbnailUrl]: url,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      timeoutRef.current = setTimeout(() => onDone(), 2000)
    } catch (err) {
      console.error('Failed to upload thumbnail for asset', err)
      handleError(err)
    }
  }

  return (
    <OptimizedImageUploader
      directoryPath="asset-thumbnails"
      filePrefix={shortid.generate()}
      onUploadedUrl={onUploaded}
      requiredWidth={300}
      requiredHeight={300}
    />
  )
}
