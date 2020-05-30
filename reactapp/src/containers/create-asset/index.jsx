import React, { useState } from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import withAuthProfile from '../../hocs/withAuthProfile'
import AssetEditor from '../../components/asset-editor'
import withRedirectOnNotAuth from '../../hocs/withRedirectOnNotAuth'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import { scrollToTop } from '../../utils'
import * as routes from '../../routes'
import Heading from '../../components/heading'
import Button from '../../components/button'

const CreateAsset = ({ auth }) => {
  const [isSaving, isSuccess, save] = useDatabaseSave(CollectionNames.Assets)
  const userId = auth.uid
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [newDocumentId, setNewDocumentId] = useState(null)

  if (isSaving) {
    return <LoadingIndicator message="Creating..." />
  }

  if (isSuccess) {
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
              isApproved: false,
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

export default withRedirectOnNotAuth(withAuthProfile(CreateAsset))
