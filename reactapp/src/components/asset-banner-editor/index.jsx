import React from 'react'

import BannerUploader from '../banner-uploader'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import Button from '../button'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { createRef } from '../../utils'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

export default ({ assetId, onDone, actionCategory, noPaper }) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save, clear] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Banner saved successfully <Button onClick={clear}>Okay</Button>
      </SuccessMessage>
    )
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save banner</ErrorMessage>
  }

  const onUploadedUrl = async url => {
    try {
      trackAction(actionCategory, 'Click save banner button')

      await save({
        [AssetFieldNames.bannerUrl]: url,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset banner', err)
      handleError(err)
    }
  }

  return <BannerUploader onUploadedUrl={onUploadedUrl} noPaper={noPaper} />
}
