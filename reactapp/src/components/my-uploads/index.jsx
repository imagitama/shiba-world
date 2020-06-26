import React from 'react'

import AssetResults from '../asset-results'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

export default () => {
  const userId = useFirebaseUserId()
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [isLoading, isErrored, assets] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.createdBy, Operators.EQUALS, userDocument],
      [AssetFieldNames.isDeleted, Operators.EQUALS, false]
    ]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find your uploaded assets</ErrorMessage>
  }

  return <AssetResults assets={assets} showCategory />
}
