import React, { useState } from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import AssetEditor from '../../components/asset-editor'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import NoPermissionMessage from '../../components/no-permission-message'

import { scrollToTop } from '../../utils'
import * as routes from '../../routes'

export default () => {
  const [isLoadingUser, isErrorLoadingUser, user] = useUserRecord()
  const [isSaving, isSuccessOrFail, save] = useDatabaseSave(
    CollectionNames.Assets
  )
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [newDocumentId, setNewDocumentId] = useState(null)

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to load your profile</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating..." />
  }

  if (isSuccessOrFail === false) {
    return <ErrorMessage>Failed to create asset</ErrorMessage>
  }

  if (isSuccessOrFail === true) {
    return (
      <SuccessMessage>
        Asset created successfully <br />
        <Button
          url={routes.viewAssetWithVar.replace(':assetId', newDocumentId)}>
          View Asset
        </Button>
      </SuccessMessage>
    )
  }

  return (
    <>
      <Heading variant="h1">Upload Asset</Heading>
      <AssetEditor
        onSubmit={async newFields => {
          scrollToTop()

          try {
            const [docId] = await save({
              ...newFields,
              // need to initialize these so our queries work later
              isApproved: false,
              isDeleted: false,
              createdAt: new Date(),
              createdBy: userDocument
            })

            setNewDocumentId(docId)
          } catch (err) {
            console.error('Failed to create asset', newFields, err)
          }
        }}
      />
    </>
  )
}
