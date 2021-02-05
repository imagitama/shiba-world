import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import { useLocation } from 'react-router'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Heading from '../heading'
import BodyText from '../body-text'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'

const Form = () => {
  const userId = useFirebaseUserId()
  const [isLoadingUser, , user] = useUserRecord()
  const [isCreating, isCreateSuccess, isCreateError, create] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')
  const location = useLocation()

  console.log(location.pathname)

  if (location.pathname === routes.login) {
    return null
  }

  if (!userId) {
    return null
  }

  // Sometimes a delay before firebase function creates their profile
  if (isLoadingUser || !user) {
    return <LoadingIndicator message="Loading your profile..." />
  }

  if (isCreating) {
    return <LoadingIndicator message="Setting up your profile..." />
  }

  if (isCreateSuccess) {
    return <SuccessMessage>Profile has been setup successfully</SuccessMessage>
  }

  if (isCreateError) {
    return (
      <ErrorMessage>
        Failed to create your profile. Please contact Peanut ASAP to fix this
      </ErrorMessage>
    )
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction('SetupProfile', 'Click save button')

      if (!fieldValue) {
        return
      }

      await create({
        [UserFieldNames.username]: fieldValue,
        [UserFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [UserFieldNames.createdAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to setup profile', { username: fieldValue }, err)
      handleError(err)
    }
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
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}

export default () => {
  const isLoggedIn = useIsLoggedIn()
  const [isLoadingUser, , username] = useUserRecord(UserFieldNames.username)

  if (isLoggedIn && !isLoadingUser && !username) {
    return <Form />
  }

  return null
}
