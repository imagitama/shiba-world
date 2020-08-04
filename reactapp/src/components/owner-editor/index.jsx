import React, { useEffect, useState } from 'react'
import AccessibilityIcon from '@material-ui/icons/Accessibility'

import TextInput from '../text-input'
import Button from '../button'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

export default ({ collectionName, id, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(collectionName, id)
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [ownerUserIdValue, setOwnerUserIdValue] = useState(null)

  useEffect(() => {
    if (!result) {
      return
    }

    const { ownedBy } = result

    if (!ownedBy) {
      return
    }

    setOwnerUserIdValue(ownedBy.id)
  }, [result === null])

  if (!userId) {
    return 'You are not logged in'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (isError) {
    return 'Error loading resource'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Owner has been changed'
  }

  if (isFailed) {
    return 'Error saving new owner'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save new owner button', id)

      const newValue = ownerUserIdValue
        ? createRef(CollectionNames.Users, ownerUserIdValue)
        : null

      await save({
        ownedBy: newValue,
        lastModifiedAt: new Date(),
        lastModifiedBy: createRef(CollectionNames.Users, userId)
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!isEditorOpen) {
    return (
      <Button
        onClick={() => setIsEditorOpen(true)}
        color="default"
        icon={<AccessibilityIcon />}>
        Change Owner
      </Button>
    )
  }

  return (
    <>
      Enter a new owner user ID:
      <TextInput
        onChange={e => setOwnerUserIdValue(e.target.value)}
        value={ownerUserIdValue}
      />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
