import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import { trackAction, actions } from '../../analytics'
import Button from '../button'

// TODO: Grab from useUserRecord
export default ({ userId }) => {
  if (!userId) {
    return 'Need user ID to edit their username'
  }

  const [isSaving, isSuccessOrFail, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')

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
          await save({
            username: fieldValue
          })

          trackAction(actions.CHANGE_USERNAME, {
            userId,
            newUsername: fieldValue
          })
        }}>
        Change Name
      </Button>
      {}
    </>
  )
}
