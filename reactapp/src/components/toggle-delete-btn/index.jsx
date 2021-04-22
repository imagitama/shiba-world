import React from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

/**
 * Assumes the item has an "isDeleted" field.
 * Sets "lastModifiedBy" and "lastModifiedAt" like every record has.
 */

export default ({
  id,
  collectionName,
  isAlreadyDeleted = null,
  onClick = null
}) => {
  const userId = useFirebaseUserId()
  const [isLoadingAsset, isErroredLoadingAsset, item] = useDatabaseQuery(
    collectionName,
    isAlreadyDeleted !== null ? false : id,
    {
      [options.queryName]: 'toggle-delete-btn'
    }
  )
  const [isSaving, , isErroredSaving, save] = useDatabaseSave(
    collectionName,
    id
  )

  const isDeleted = item ? item.isDeleted : isAlreadyDeleted

  if (!userId || isLoadingAsset || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isErroredSaving) {
    return <Button disabled>Error</Button>
  }

  const onBtnClick = async () => {
    try {
      const newValue = !isDeleted

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        isDeleted: newValue,
        lastModifiedBy: createRef(CollectionNames.Users, userId),
        lastModifiedAt: new Date()
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
