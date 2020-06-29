import React, { useState } from 'react'

import AssetEditor from '../../components/asset-editor'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'

import useDatabase from '../../hooks/useDatabase'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'

import { scrollToTop } from '../../utils'
import * as routes from '../../routes'

export default ({ match: { params } }) => {
  const [isLoadingUser, isErrorLoadingUser, user] = useUserRecord()
  const [isLoading, isErrored, asset] = useDatabase(
    CollectionNames.Assets,
    params.assetId
  )
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [newFields, setNewFields] = useState()
  const [isSaving, wasSaveSuccessOrFail, save] = useDatabaseSave(
    CollectionNames.Assets,
    params.assetId
  )

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to load your profile</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <>
      {wasSaveSuccessOrFail === true && (
        <SuccessMessage>
          Save success
          <br />
          <Button
            url={routes.viewAssetWithVar.replace(':assetId', params.assetId)}>
            View Asset
          </Button>
        </SuccessMessage>
      )}
      {isLoading || isSaving ? (
        <LoadingIndicator
          message={isSaving ? 'Saving...' : isLoading ? 'Loading...' : ''}
        />
      ) : isErrored || !asset ? (
        <ErrorMessage>Failed to load the asset for editing</ErrorMessage>
      ) : wasSaveSuccessOrFail === false ? (
        <ErrorMessage>Failed to edit the asset</ErrorMessage>
      ) : (
        <AssetEditor
          assetId={params.assetId}
          asset={newFields ? newFields : asset}
          onSubmit={fields => {
            scrollToTop()

            save({
              ...fields,
              lastModifiedBy: userDocument,
              lastModifiedAt: new Date()
            })

            setNewFields(fields)
          }}
        />
      )}
    </>
  )
}
