import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

const useStyles = makeStyles({
  input: {
    width: '50%'
  }
})

export default ({ onSaveClick = null }) => {
  const userId = useFirebaseUserId()
  const [isLoadingUser, isErrorLoadingUser, user] = useUserRecord()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')
  const classes = useStyles()

  if (!userId || isLoadingUser) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingUser) {
    return <ErrorMessage>Failed to load your user account</ErrorMessage>
  }

  const { [UserFieldNames.username]: username } = user

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      if (!fieldValue) {
        return
      }

      await save({
        [UserFieldNames.username]: fieldValue,
        [UserFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [UserFieldNames.lastModifiedAt]: new Date()
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
        variant="outlined"
        className={classes.input}
      />{' '}
      <Button color="primary" onClick={onSaveBtnClick}>
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
