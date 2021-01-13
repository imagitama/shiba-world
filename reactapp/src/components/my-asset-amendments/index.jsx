import React from 'react'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetAmendmentResults from '../asset-amendment-results'
import Heading from '../heading'

export default () => {
  const userId = useFirebaseUserId()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.AssetAmendments,
    undefined,
    undefined,
    undefined,
    true,
    undefined,
    true
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading amendments..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load amendments</ErrorMessage>
  }

  const myResults = results.filter(
    result => result[AssetAmendmentFieldNames.createdBy].id === userId
  )
  const otherResults = results.filter(
    result =>
      result[AssetAmendmentFieldNames.asset][AssetFieldNames.createdBy].id ===
        userId ||
      (result[AssetAmendmentFieldNames.asset][AssetFieldNames.ownedBy] &&
        result[AssetAmendmentFieldNames.asset][AssetFieldNames.ownedBy].id ===
          userId)
  )

  return (
    <>
      <Heading variant="h3">My Amendments</Heading>
      <AssetAmendmentResults results={myResults} />
      <Heading variant="h3">Amendments To My Assets</Heading>
      <AssetAmendmentResults results={otherResults} />
    </>
  )
}
