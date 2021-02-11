import React from 'react'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'
import PublishIcon from '@material-ui/icons/Publish'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, isPrivate, onDone, ...props }) => {
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
        icon={isPrivate ? <PublishIcon /> : <VisibilityOffIcon />}
        color="tertiary"
        onClick={!isSaving && onToggleClick}
        {...props}>
        {isSaving
          ? 'Saving...'
          : isPrivate
          ? 'Publish Asset'
          : 'Unpublish Asset'}
      </Button>
    </>
  )
}
