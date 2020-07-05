import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { trackAction, actions } from '../../analytics'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

export default () => {
  const userId = useFirebaseUserId()
  const [isLoadingUser, isErrorLoadingUser, user] = useUserRecord()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')

  // TODO: Show error?
  if (!userId) {
    return null
  }

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to load your user account</ErrorMessage>
  }

  const { [UserFieldNames.username]: username } = user

  const onSaveBtnClick = async () => {
    try {
      await save({
        [UserFieldNames.username]: fieldValue,
        [UserFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [UserFieldNames.lastModifiedAt]: new Date()
      })

      trackAction(actions.CHANGE_USERNAME, {
        userId,
        newUsername: fieldValue
      })
    } catch (err) {
      console.error(
        'Failed to edit username',
        { userId: user.id, newUsername: fieldValue },
        err
      )
      handleError(err)
    }
  }

  return (
    <>
      Enter a new name to change it:
      <br />
      <br />
      <TextField
        defaultValue={username}
        onChange={event => setFieldValue(event.target.value)}
      />
      <Button variant="contained" color="primary" onClick={onSaveBtnClick}>
        Change
      </Button>
      {isSaving
        ? 'Saving...'
        : isSaveSuccess
        ? 'Username changed successfully'
        : isSaveError
        ? 'Failed to change your username - please try again'
        : null}
    </>
  )
}
