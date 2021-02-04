import React from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

export default ({ assetId, isAlreadyDeleted = null, onClick = null }) => {
  const userId = useFirebaseUserId()
  const [, , user] = useUserRecord()
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    isAlreadyDeleted !== null ? false : assetId,
    {
      [options.queryName]: 'delete-asset-btn'
    }
  )
  const [isSaving, , isErroredSavingAsset, saveAsset] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  const isDeleted = asset ? asset[AssetFieldNames.isDeleted] : isAlreadyDeleted

  if (!user || isLoadingAsset || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isErroredSavingAsset) {
    return <Button disabled>Error</Button>
  }

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
