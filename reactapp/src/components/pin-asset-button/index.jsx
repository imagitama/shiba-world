import React from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, isAlreadyPinned = undefined, onClick = null }) => {
  // TODO: Check if they are editor! We are assuming the parent does this = not good

  const userId = useFirebaseUserId()

  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    isAlreadyPinned !== undefined ? false : assetId,
    {
      [options.queryName]: 'pin-asset-btn'
    }
  )
  const [isSaving, , isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  const isPinned = asset ? asset[AssetFieldNames.isPinned] : isAlreadyPinned

  if (isLoadingAsset || isSaving) {
    // TODO: Remove string duplication with color prop
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isSaveErrored) {
    return <Button disabled>Error</Button>
  }

  const onBtnClick = async () => {
    try {
      const newValue = !isPinned

      if (onClick) {
        onClick(newValue)
      }

      await save({
        [AssetFieldNames.isPinned]: newValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to pin or unpin asset', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isPinned ? 'Unpin' : 'Pin'}
    </Button>
  )
}
