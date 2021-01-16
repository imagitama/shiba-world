import React from 'react'
import LoyaltyIcon from '@material-ui/icons/Loyalty'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ assetId, isAdult, onDone }) => {
  const userId = useFirebaseUserId()
  const [isSaving, , , save] = useDatabaseSave(CollectionNames.Assets, assetId)

  const onToggleClick = async () => {
    try {
      const newIsAdultValue = !isAdult

      await save({
        [AssetFieldNames.isAdult]: newIsAdultValue,
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
      console.error('Failed to save asset is adult', err)
      handleError(err)
    }
  }

  return (
    <>
      <Button
        icon={<LoyaltyIcon />}
        color="tertiary"
        onClick={!isSaving && onToggleClick}>
        {isSaving ? 'Saving...' : isAdult ? 'Mark as SFW' : 'Mark as NSFW'}
      </Button>
    </>
  )
}
