import React from 'react'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../loading-indicator'
import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'

export default () => {
  // Do not include nsfw filter as we need another firestore index
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.isAdult, Operators.EQUALS, false],
      [AssetFieldNames.isApproved, Operators.EQUALS, true]
    ],
    10,
    [AssetFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get recent assets</ErrorMessage>
  }

  return <AssetResults assets={results} />
}
