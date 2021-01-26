import React from 'react'
import VisibilityOff from '@material-ui/icons/VisibilityOff'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, isPrivate, onDone }) => {
  const userId = useFirebaseUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Assets, assetId)

  const onToggleClick = async () => {
    try {
      const newIsPrivateValue = !isPrivate

      await save({
        [AssetFieldNames.isPrivate]: newIsPrivateValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error('Failed to save asset is private', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button
        icon={<VisibilityOff />}
        color="tertiary"
        onClick={!isSaving && onToggleClick}>
        {isSaving
          ? 'Saving...'
          : isPrivate
          ? 'Mark as Not Draft'
          : 'Mark as Draft'}
      </Button>
    </>
  )
}
