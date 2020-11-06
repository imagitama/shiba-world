import React from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseQuery, {
  CollectionNames,
  specialCollectionIds,
  FeaturedAssetFieldNames
} from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, onClick = null }) => {
  // TODO: Check if they are editor! We are assuming the parent does this = not good

  const userId = useFirebaseUserId()

  const [isLoading, isErroredLoadingFeatured, result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.featured
  )
  const [isSaving, , isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Special,
    specialCollectionIds.featured
  )

  if (isLoading || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingFeatured || isSaveErrored) {
    return <Button disabled>Error</Button>
  }

  const isFeatured =
    result[FeaturedAssetFieldNames.asset] &&
    result[FeaturedAssetFieldNames.asset].id === assetId

  const onBtnClick = async () => {
    try {
      const newValue = !isFeatured

      if (onClick) {
        onClick(newValue)
      }

      await save({
        [FeaturedAssetFieldNames.asset]: newValue
          ? createRef(CollectionNames.Assets, assetId)
          : null,
        [FeaturedAssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [FeaturedAssetFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to feature or unfeature asset', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isFeatured ? 'Unfeature' : 'Feature'}
    </Button>
  )
}
