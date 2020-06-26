import React from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import { trackAction, actions } from '../../analytics'
import Button from '../button'

export default ({ assetId }) => {
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (isLoadingUser || isLoadingAsset || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (
    isErroredLoadingUser ||
    isErroredLoadingAsset ||
    didSaveSucceedOrFail === false
  ) {
    return <Button disabled>Error</Button>
  }

  if (!user) {
    return null
  }

  const { isPinned } = asset

  const onBtnClick = async () => {
    try {
      await save({
        isPinned: !isPinned,
        lastModifiedBy: userDocument,
        lastModifiedAt: new Date()
      })

      trackAction(isPinned ? actions.UNPIN_ASSET : actions.PIN_ASSET, {
        assetId,
        userId: user && user.id
      })
    } catch (err) {
      console.error('Failed to pin or unpin asset', err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isPinned ? 'Unpin' : 'Pin'}
    </Button>
  )
}
