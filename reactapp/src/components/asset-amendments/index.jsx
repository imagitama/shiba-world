import React from 'react'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetAmendmentResults from '../asset-amendment-results'

export default ({ assetId }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.AssetAmendments,
    [
      [
        AssetAmendmentFieldNames.asset,
        Operators.EQUALS,
        createRef(CollectionNames.Assets, assetId)
      ],
      [AssetAmendmentFieldNames.isRejected, Operators.EQUALS, null]
    ],
    undefined,
    undefined,
    true,
    undefined,
    true
  )

  // LOADING

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading amendments..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load amendments</ErrorMessage>
  }

  if (!results.length) {
    return <ErrorMessage>No amendments</ErrorMessage>
  }

  return (
    <AssetAmendmentResults
      results={results}
      showControls={true}
      analyticsCategoryName="ViewAsset"
    />
  )
}