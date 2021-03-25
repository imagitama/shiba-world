import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { useLocation } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  UserFieldNames,
  ProfileFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Heading from '../heading'
import FavoriteSpeciesEditor from '../favorite-species-editor'
import VrPlatformChooser from '../vr-platform-chooser'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'
import { mediaQueryForMobiles } from '../../media-queries'

const useStyles = makeStyles({
  root: {
    margin: '2rem auto',
    textAlign: 'center',
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  input: {
    width: '100%',
    maxWidth: '500px'
  },
  formControls: {
    textAlign: 'center',
    marginTop: '3rem'
  }
})

export default ({ analyticsCategory, onDone }) => {
  const userId = useFirebaseUserId()
  const [isLoadingUser, , user] = useUserRecord()
  const [isCreating, isCreateSuccess, isCreateError, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )
  const [fieldValue, setFieldValue] = useState('')
  const location = useLocation()
  const classes = useStyles()
  const [stepIdx, setStepIdx] = useState(0)

  if (location.pathname === routes.login) {
    return null
  }

  if (!userId) {
    return null
  }

  // Sometimes a delay before firebase function creates their profile
  if (isLoadingUser || !user) {
    return null
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
      trackAction(analyticsCategory, 'Click save button')

      if (!fieldValue) {
        return
      }

      await save({
        [UserFieldNames.username]: fieldValue,
        [UserFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [UserFieldNames.createdAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to setup profile', { username: fieldValue }, err)
      handleError(err)
    }
  }

  const nextStep = () => {
    console.log('next step!')
    setStepIdx(currentVal => currentVal + 1)
  }

  return (
    <div className={classes.root}>
      <Heading variant="h1">Welcome to VRCArena</Heading>
      <Heading variant="h2">Set up your profile</Heading>

      {stepIdx === 0 ? (
        <FavoriteSpeciesEditor
          onDone={() => nextStep()}
          analyticsCategory={analyticsCategory}
        />
      ) : stepIdx === 1 ? (
        <VrPlatformChooser
          onDone={() => nextStep()}
          analyticsCategory={analyticsCategory}
        />
      ) : (
        <>
          <TextField
            value={fieldValue}
            label="Username"
            variant="outlined"
            onChange={event => setFieldValue(event.target.value)}
            className={classes.input}
          />
          <div className={classes.formControls}>
            <Button onClick={onSaveBtnClick} isDisabled={isCreating}>
              Save
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
