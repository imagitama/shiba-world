import React from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

export default ({ assetId, onClick = null }) => {
  const userId = useFirebaseUserId()
  const [, , user] = useUserRecord()
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, , isErroredSavingAsset, saveAsset] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (!user || isLoadingAsset || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isErroredSavingAsset) {
    return <Button disabled>Error</Button>
  }

  const { [AssetFieldNames.isDeleted]: isDeleted } = asset

  const onBtnClick = async () => {
    try {
      const newValue = !isDeleted

      if (onClick) {
        onClick({ newValue })
      }

      await saveAsset({
        [AssetFieldNames.isDeleted]: newValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to edit asset to delete or undelete', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isDeleted ? 'Restore' : 'Delete'}
    </Button>
  )
}
