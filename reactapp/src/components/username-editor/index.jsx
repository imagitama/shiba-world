import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import { trackAction, actions } from '../../analytics'
import Button from '../button'

export default () => {
  const [isLoadingUser, isErrorLoadingUser, user] = useUserRecord()
  const [isSaving, isSuccessOrFail, save] = useDatabaseSave(
    CollectionNames.Users,
    user && user.id
  )
  const [fieldValue, setFieldValue] = useState('')

  if (isLoadingUser) {
    return 'Loading...'
  }

  if (isErrorLoadingUser) {
    return 'Failed to load your profile'
  }

  if (!user) {
    return 'You must be logged in to change your username'
  }

  if (isSaving) {
    return 'Changing your username...'
  }

  if (isSuccessOrFail === true) {
    return 'Username has been changed successfully'
  }

  if (isSuccessOrFail === false) {
    return 'Failed to change your username. Probably a connection or permissions error'
  }

  return (
    <>
      Enter in your new name:{' '}
      <TextField onChange={event => setFieldValue(event.target.value)} /> <br />
      <Button
        variant="contained"
        color="primary"
        onClick={async () => {
          try {
            await save({
              username: fieldValue
            })

            trackAction(actions.CHANGE_USERNAME, {
              userId: user.id,
              newUsername: fieldValue
            })
          } catch (err) {
            console.error(
              'Failed to edit username',
              { userId: user.id, newUsername: fieldValue },
              err
            )
          }
        }}>
        Change Name
      </Button>
      {}
    </>
  )
}
