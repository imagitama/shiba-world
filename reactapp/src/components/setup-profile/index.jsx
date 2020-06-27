import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Heading from '../heading'
import BodyText from '../body-text'
import { handleError } from '../../error-handling'

export default () => {
  const uid = useFirebaseUserId()
  const [, , user] = useUserRecord()
  const userId = user ? user.id : null
  const [isCreating, isCreateSuccessOrFail, create] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')

  // Sometimes a delay before firebase function creates their profile
  if ((uid && !userId) || user.username !== '') {
    return (
      <LoadingIndicator
        message={
          <>
            Looking up your profile...
            <br />
            <br />
            (contact Peanut if this never goes away)
          </>
        }
      />
    )
  }

  if (isCreating) {
    return <LoadingIndicator message="Setting up your profile..." />
  }

  if (isCreateSuccessOrFail === true) {
    return <SuccessMessage>Profile has been setup successfully</SuccessMessage>
  }

  if (isCreateSuccessOrFail === false) {
    return <ErrorMessage>Failed to create your profile</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Welcome to VRCArena</Heading>
      <BodyText>Before you can continue please set up your profile:</BodyText>
      <FormControl>
        <TextField
          value={fieldValue}
          label="Username"
          onChange={event => setFieldValue(event.target.value)}
        />
      </FormControl>
      <Button
        onClick={async () => {
          try {
            await create({
              username: fieldValue
            })
          } catch (err) {
            console.error(
              'Failed to setup profile',
              { username: fieldValue },
              err
            )
            handleError(err)
          }
        }}>
        Save
      </Button>
    </>
  )
}
