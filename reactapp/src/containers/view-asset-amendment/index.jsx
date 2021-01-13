import React from 'react'

import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'
import SuccessMessage from '../../components/success-message'
import Button from '../../components/button'
import AssetResultsItem from '../../components/asset-results-item'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { createRef, canEditAsset, isUrlAnImage } from '../../utils'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'

function FieldValue({ val }) {
  if (val === true) {
    return 'true'
  }
  if (val === false) {
    return 'false'
  }
  if (val === null) {
    return '(nothing)'
  }

  if (typeof val === 'string') {
    if (isUrlAnImage(val)) {
      return <img src={val} alt="Diff" />
    }
  }

  if (val) {
    return val.toString()
  }
  return '(nothing)'
}

function AssetDiff({ newFields, actual }) {
  return (
    <ul>
      {Object.entries(newFields).map(([fieldName, fieldValue]) => (
        <li key={fieldName}>
          <strong>{fieldName}</strong>
          <ul>
            <li>
              Old: <FieldValue val={actual[fieldName]} />
            </li>
            <li>
              New: <FieldValue val={fieldValue} />
            </li>
          </ul>
        </li>
      ))}
    </ul>
  )
}

export default ({
  match: {
    params: { assetAmendmentId }
  }
}) => {
  const userId = useFirebaseUserId()
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [
    isLoadingAmendment,
    isErroredLoadingAmendment,
    amendment
  ] = useDatabaseQuery(CollectionNames.AssetAmendments, assetAmendmentId)

  const assetId = amendment
    ? amendment[AssetAmendmentFieldNames.asset].id
    : null

  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId ? assetId : false
  )
  const [
    isSavingAmendment,
    isSaveAmendmentSuccess,
    isSaveAmendmentError,
    saveAmendment
  ] = useDatabaseSave(CollectionNames.AssetAmendments, assetAmendmentId)
  const [
    isSavingAsset,
    isSaveAssetSuccess,
    isSaveAssetError,
    saveAsset
  ] = useDatabaseSave(CollectionNames.Assets, assetId ? assetId : false)

  if (!assetAmendmentId) {
    return <ErrorMessage>Must provide an amendment ID</ErrorMessage>
  }

  if (isLoadingUser || isLoadingAmendment || isLoadingAsset) {
    return <LoadingIndicator />
  }

  if (
    isErroredLoadingUser ||
    isErroredLoadingAmendment ||
    isErroredLoadingAsset
  ) {
    return (
      <ErrorMessage>
        Failed to load your user account/amendment/asset
      </ErrorMessage>
    )
  }

  if (!amendment) {
    return <ErrorMessage>Amendment does not exist</ErrorMessage>
  }

  if (!asset) {
    return <ErrorMessage>Asset for the amendment does not exist</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  if (isSavingAsset) {
    return <LoadingIndicator message="Applying to asset..." />
  }

  if (isSaveAssetError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isSavingAmendment) {
    return <LoadingIndicator message="Updating status of amendment..." />
  }

  if (isSaveAmendmentError) {
    return <ErrorMessage>Failed to save amendment</ErrorMessage>
  }

  if (isSaveAmendmentSuccess && isSaveAssetSuccess) {
    return (
      <SuccessMessage>
        Amendment has been applied successfully!
        <br />
        <br />
        <Button url={routes.viewAssetWithVar.replace(':assetId', assetId)}>
          View Asset
        </Button>
      </SuccessMessage>
    )
  }

  const onApplyClick = async () => {
    try {
      const fieldsToSave = amendment[AssetAmendmentFieldNames.fields]

      await saveAsset({
        ...fieldsToSave,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      await saveAmendment({
        [AssetAmendmentFieldNames.isRejected]: false,
        [AssetAmendmentFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetAmendmentFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save asset with amendment fields', err)
      handleError(err)
    }
  }

  const onRejectClick = async () => {
    try {
      await saveAmendment({
        [AssetAmendmentFieldNames.isRejected]: true,
        [AssetAmendmentFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetAmendmentFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save asset with amendment fields', err)
      handleError(err)
    }
  }

  const canApplyOrReject = canEditAsset(
    user,
    asset[AssetFieldNames.createdBy],
    asset[AssetFieldNames.ownedBy]
  )

  const { [AssetAmendmentFieldNames.isRejected]: isRejected } = amendment

  return (
    <>
      <Heading variant="h1">Asset Amendment</Heading>
      <AssetResultsItem asset={asset} />
      <Heading variant="h2">Status</Heading>
      {isRejected === true
        ? 'Rejected'
        : isRejected === false
        ? 'Applied'
        : 'Waiting for owner'}
      <Heading variant="h2">Changes</Heading>
      <AssetDiff
        newFields={amendment[AssetAmendmentFieldNames.fields]}
        actual={asset}
      />
      {canApplyOrReject && (
        <>
          <Heading variant="h2">Asset Owner Options</Heading>
          <Button onClick={onApplyClick}>Apply</Button>{' '}
          <Button color="default" onClick={onRejectClick}>
            Reject
          </Button>
        </>
      )}
    </>
  )
}
