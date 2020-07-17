import React, { useState } from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import AssetEditor from '../../components/asset-editor'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'

import { scrollToTop } from '../../utils'
import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

export default () => {
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets
  )
  const [newDocumentId, setNewDocumentId] = useState(null)

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to create asset</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Asset created successfully <br />
        <Button
          url={routes.viewAssetWithVar.replace(':assetId', newDocumentId)}
          onClick={() =>
            trackAction(
              'CreateAsset',
              'Click view created asset button',
              newDocumentId
            )
          }>
          View Asset
        </Button>
      </SuccessMessage>
    )
  }

  return (
    <>
      <AssetEditor
        onSubmit={async newFields => {
          try {
            trackAction('CreateAsset', 'Click create button')

            scrollToTop()

            const [docId] = await save({
              ...newFields,
              // need to initialize these so our queries work later
              [AssetFieldNames.isApproved]: false,
              [AssetFieldNames.isDeleted]: false,
              [AssetFieldNames.createdBy]: createRef(
                CollectionNames.Users,
                userId
              ),
              [AssetFieldNames.createdAt]: new Date()
            })

            setNewDocumentId(docId)
          } catch (err) {
            console.error('Failed to create asset', newFields, err)
            handleError(err)
          }
        }}
      />
    </>
  )
}
