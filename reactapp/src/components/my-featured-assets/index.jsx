import React from 'react'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'

export default () => {
  const userId = useFirebaseUserId()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.FeaturedAssetsForUsers,
    userId,
    undefined,
    undefined,
    false,
    undefined,
    true
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading featured assets..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load featured assets</ErrorMessage>
  }

  if (!result || !result.assets.length) {
    return (
      <ErrorMessage>
        You do not have any featured assets. If you are a patron you can view an
        asset and click Feature to add it to the rotation.
      </ErrorMessage>
    )
  }

  return <AssetResults assets={result.assets} />
}
