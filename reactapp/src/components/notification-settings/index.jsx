import React, { useState, useEffect } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames,
  ProfileFieldNames
} from '../../hooks/useDatabaseQuery'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import Button from '../button'
import TextInput from '../text-input'
import FormControls from '../form-controls'

import {
  NotificationEvents,
  NotificationMethods,
  defaultNotificationPrefs
} from '../../notifications'

const getLabelForEventName = eventName => {
  switch (eventName) {
    case NotificationEvents.ASSET_AMENDED:
      return 'My assets are amended with new tags'
    case NotificationEvents.ASSET_APPROVED:
      return 'My assets are approved'
    case NotificationEvents.ASSET_DELETED:
      return 'My assets are rejected or deleted'
    case NotificationEvents.COMMENT_ON_ASSET:
      return 'Someone comments on my assets'
    case NotificationEvents.COMMENT_ON_USER:
      return 'Someone comments on my user profile'
    case NotificationEvents.TAGGED_IN_COMMENT:
      return 'Someone tags me in a comment'
    case NotificationEvents.ASSET_NEEDS_APPROVAL:
      return 'An asset needs approval (staff only)'
    case NotificationEvents.REPORT_CREATED:
      return 'A report has been created (staff only)'
    default:
      return `Unknown event ${eventName}`
  }
}

const getLabelForMethodName = methodName => {
  switch (methodName) {
    case NotificationMethods.WEB:
      return 'Notification in the website (top right corner)'
    case NotificationMethods.EMAIL:
      return 'Email'
    default:
      return `Unknown method ${methodName}`
  }
}

export default () => {
  const myUserId = useFirebaseUserId()
  const [isLoadingProfile, isErrorLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    myUserId
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Profiles,
    myUserId
  )
  const [newPrefs, setNewPrefs] = useState(defaultNotificationPrefs)
  const [notificationEmail, setNotificationEmail] = useState('')

  useEffect(() => {
    if (!profile) {
      return
    }
    if (profile[ProfileFieldNames.notificationPrefs]) {
      setNewPrefs(profile[ProfileFieldNames.notificationPrefs])
    }
    if (profile[ProfileFieldNames.notificationEmail]) {
      setNotificationEmail(profile[ProfileFieldNames.notificationEmail])
    }
  }, [profile !== null])

  if (isLoadingProfile || !profile || isSaving) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingProfile) {
    return <ErrorMessage>Failed to load your profile</ErrorMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const onChangeEvent = (e, eventName) => {
    setNewPrefs(currentVal => ({
      ...currentVal,
      events: {
        ...currentVal.events,
        [eventName]: e.target.checked
      }
    }))
  }

  const onChangeMethod = (e, methodName) => {
    setNewPrefs(currentVal => ({
      ...currentVal,
      methods: {
        ...currentVal.methods,
        [methodName]: e.target.checked
      }
    }))
  }

  const onSaveClick = async () => {
    try {
      await save({
        [ProfileFieldNames.notificationPrefs]: newPrefs,
        [ProfileFieldNames.notificationEmail]: notificationEmail,
        [ProfileFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          myUserId
        ),
        [ProfileFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save profile with new notification prefs', err)
      handleError(err)
    }
  }

  return (
    <FormControl>
      <Heading variant="h3">Events</Heading>
      <p>Choose what kind of events you want to subscribe to.</p>
      {Object.keys(NotificationEvents).map(eventName => (
        <FormControlLabel
          key={eventName}
          control={
            <Checkbox
              checked={newPrefs.events[eventName] !== false}
              onChange={e => onChangeEvent(e, eventName)}
            />
          }
          label={getLabelForEventName(eventName)}
        />
      ))}
      <Heading variant="h3">Methods</Heading>
      <p>Choose how you want to receive your notifications.</p>
      {Object.keys(NotificationMethods)
        .filter(methodName => methodName !== NotificationMethods.DISCORD)
        .map(methodName => (
          <FormControlLabel
            key={methodName}
            control={
              <Checkbox
                checked={newPrefs.methods[methodName] !== false}
                onChange={e => onChangeMethod(e, methodName)}
              />
            }
            label={getLabelForMethodName(methodName)}
          />
        ))}
      <Heading variant="h3">Email</Heading>
      <p>
        If you want to receive your notifications at a different email you can
        enter it here (or leave it blank to use your sign up one).
      </p>
      <TextInput
        onChange={e => setNotificationEmail(e.target.value)}
        value={notificationEmail}
        placeholder="eg. notifyme@hotmail.com"
      />
      <br />
      <br />
      <FormControls>
        <Button onClick={onSaveClick}>Save</Button>
      </FormControls>
      <br />
      <br />
      {isSaving && 'Saving...'}
      {isSaveError && 'Failed to save. Please try again'}
      {isSaveSuccess && 'Saved successfully'}
    </FormControl>
  )
}
