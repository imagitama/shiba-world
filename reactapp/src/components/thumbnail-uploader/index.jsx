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
import { paths, formHideDelay } from '../../config'

export default ({ assetId, onDone, skipDelay = false }) => {
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

      if (skipDelay) {
        onDone()
      } else {
        // this could not happen if we remount the whole component when avatar URL changes
        timeoutRef.current = setTimeout(() => onDone(), formHideDelay)
      }
    } catch (err) {
      console.error('Failed to upload thumbnail for asset', err)
      handleError(err)
    }
  }

  return (
    <OptimizedImageUploader
      directoryPath={paths.assetThumbnailDir}
      filePrefix={shortid.generate()}
      onUploadedUrl={onUploaded}
      requiredWidth={300}
      requiredHeight={300}
    />
  )
}
