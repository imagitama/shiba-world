import React, { useState } from 'react'

import AssetEditor from '../../components/asset-editor'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'

import useDatabase from '../../hooks/useDatabase'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { scrollToTop } from '../../utils'
import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

export default ({ match: { params } }) => {
  const assetId = params.assetId
  const userId = useFirebaseUserId()
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabase(
    CollectionNames.Assets,
    assetId
  )
  const [newFields, setNewFields] = useState()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isLoadingAsset || !asset) {
    return <LoadingIndicator message="Loading asset..." />
  }

  if (isErroredLoadingAsset) {
    return <ErrorMessage>Failed to load the asset</ErrorMessage>
  }

  const onEditorSubmit = async fields => {
    try {
      trackAction('EditAsset', 'Click save button', assetId)

      scrollToTop()

      await save({
        ...fields,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      setNewFields(fields)
    } catch (err) {
      console.error('Failed to save asset to db', err)
      handleError(err)
    }
  }

  return (
    <>
      {isSaveSuccess ? (
        <SuccessMessage>
          Save success
          <br />
          <Button
            url={routes.viewAssetWithVar.replace(':assetId', assetId)}
            onClick={() =>
              trackAction('EditAsset', 'Click edited asset button', assetId)
            }>
            View Asset
          </Button>
        </SuccessMessage>
      ) : isSaving ? (
        <LoadingIndicator message="Saving..." />
      ) : isSaveError ? (
        <ErrorMessage>Failed to save the asset. Maybe try again?</ErrorMessage>
      ) : null}
      <AssetEditor
        assetId={assetId}
        asset={newFields ? newFields : asset}
        onSubmit={onEditorSubmit}
      />
    </>
  )
}
