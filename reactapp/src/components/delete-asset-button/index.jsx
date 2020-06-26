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

  const { isDeleted } = asset

  const onBtnClick = async () => {
    try {
      await save({
        isDeleted: !isDeleted,
        lastModifiedBy: userDocument,
        lastModifiedAt: new Date()
      })

      trackAction(isDeleted ? actions.RESTORE_ASSET : actions.isDeleted, {
        assetId,
        userId: user && user.id
      })
    } catch (err) {
      console.error('Failed to edit asset to delete or undelete', err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isDeleted ? 'Restore' : 'Delete'}
    </Button>
  )
}
