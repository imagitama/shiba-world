import React, { useEffect, useState } from 'react'
import AccessibilityIcon from '@material-ui/icons/Accessibility'

import Button from '../button'
import SearchForIdForm from '../search-for-id-form'

import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'
import { doesDocumentExist } from '../../firestore'
import { searchIndexNames } from '../../modules/app'

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
        color="tertiary"
        icon={<AccessibilityIcon />}>
        Change Owner
      </Button>
    )
  }

  return (
    <>
      <SearchForIdForm
        indexName={searchIndexNames.USERS}
        fieldAsLabel={UserFieldNames.username}
        onDone={(id, searchResult) => {
          setOwnerUserIdValue(id)
        }}
      />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
