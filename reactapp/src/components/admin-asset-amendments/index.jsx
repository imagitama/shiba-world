import React from 'react'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetAmendmentResults from '../asset-amendment-results'

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.AssetAmendments,
    [[AssetAmendmentFieldNames.isRejected, Operators.EQUALS, null]],
    {
      [options.subscribe]: true,
      [options.populateRefs]: true,
      [options.queryName]: 'admin-asset-amendments'
    }
  )

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
      analyticsCategoryName="AdminAssetAmendments"
    />
  )
}
