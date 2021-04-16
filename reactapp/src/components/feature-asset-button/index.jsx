import React from 'react'
import StarIcon from '@material-ui/icons/Star'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseQuery, {
  CollectionNames,
  FeaturedAssetForUsersFieldNames
} from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

const removeFromFeatured = (assetId, assetRefs) => {
  return assetRefs.filter(assetRef => assetRef.id !== assetId)
}

const addToFeatured = (assetId, assetRefs) => {
  return assetRefs.concat([createRef(CollectionNames.Assets, assetId)])
}

export default ({ assetId, tags = [], onClick = null }) => {
  const userId = useFirebaseUserId()

  const [isLoading, isErroredLoadingFeatured, result] = useDatabaseQuery(
    CollectionNames.FeaturedAssetsForUsers,
    userId
  )
  const [isSaving, , isSaveErrored, save] = useDatabaseSave(
    CollectionNames.FeaturedAssetsForUsers,
    userId
  )

  if (isLoading || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingFeatured || isSaveErrored) {
    return <Button disabled>Error</Button>
  }

  const isFeatured =
    result && result.assets && result.assets.find(asset => asset.id === assetId)

  if (!isFeatured && result && result.assets && result.assets.length > 0) {
    return <span>You can only have 1 featured asset at a time</span>
  }

  const onBtnClick = async () => {
    try {
      if (onClick) {
        onClick()
      }

      // a way for "new" avatars to be shown on the homepage/avatar listing to help promote them
      const isToOverride = !isFeatured && tags.includes('new')

      await save({
        [FeaturedAssetForUsersFieldNames.assets]: isFeatured
          ? removeFromFeatured(assetId, result ? result.assets : [])
          : addToFeatured(assetId, result ? result.assets : []),
        [FeaturedAssetForUsersFieldNames.overrideAsset]: isToOverride
          ? createRef(CollectionNames.Assets, assetId)
          : null,
        [FeaturedAssetForUsersFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [FeaturedAssetForUsersFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to feature or unfeature asset', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick} icon={<StarIcon />}>
      {isFeatured ? 'Unfeature' : 'Feature'}
    </Button>
  )
}
