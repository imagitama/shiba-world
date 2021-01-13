import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'
import Message from '../../components/message'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { createRef } from '../../utils'

export default ({
  match: {
    params: { assetId }
  }
}) => {
  const [isLoading, isErrored, user] = useUserRecord()
  const [isLoadingAsset, isErroredLoadingAsset, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )

  if (!assetId) {
    return <ErrorMessage>Must provide an asset ID</ErrorMessage>
  }

  if (isLoading || isLoadingAsset) {
    return <LoadingIndicator />
  }

  if (isErrored || isErroredLoadingAsset) {
    return (
      <ErrorMessage>Failed to load your user account or the asset</ErrorMessage>
    )
  }

  if (!result) {
    return <ErrorMessage>Asset does not exist</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Amend Asset</Heading>
      <Message>
        <p>
          You can propose an amendment to an existing asset by filling out this
          form. The owner of the asset will be notified of your request.
        </p>
        <p>
          If the owner does not respond quickly you can message the staff team
          in our Discord (click the Discord icon next to the logo).
        </p>
        <p>
          <strong>Don't forget to click "Save" on the fields!</strong>
        </p>
      </Message>
      <GenericEditor
        collectionName={CollectionNames.AssetAmendments}
        id={null}
        analyticsCategory={'CreateAssetAmendment'}
        saveBtnAction="Click save asset amendment button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        getSuccessUrl={newId =>
          routes.viewAssetAmendmentWithVar.replace(':assetAmendmentId', newId)
        }
        cancelUrl={routes.viewAssetWithVar.replace(':assetId', assetId)}
        overrideFormFields={{
          [AssetAmendmentFieldNames.asset]: createRef(
            CollectionNames.Assets,
            assetId
          )
        }}
      />
    </>
  )
}
