import React from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'

import { trackAction, actions } from '../../analytics'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId }) => {
  // TODO: Check if they are editor! We are assuming the parent does this = not good

  const userId = useFirebaseUserId()

  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, , isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (isLoadingAsset || isSaving) {
    // TODO: Remove string duplication with color prop
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isSaveErrored) {
    return <Button disabled>Error</Button>
  }

  const { [AssetFieldNames.isPinned]: isPinned } = asset

  const onBtnClick = async () => {
    try {
      await save({
        [AssetFieldNames.isPinned]: !isPinned,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      trackAction(isPinned ? actions.UNPIN_ASSET : actions.PIN_ASSET, {
        assetId,
        userId
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
