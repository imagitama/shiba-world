import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'
import DarkModeToggle from '../../components/darkmode-toggle'
import AssetResults from '../../components/asset-results'
import Button from '../../components/button'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import * as routes from '../../routes'

function MyUploads() {
  const userId = useFirebaseUserId()
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [isLoading, isErrored, assets] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.createdBy, Operators.EQUALS, userDocument],
      [AssetFieldNames.isDeleted, Operators.EQUALS, false]
    ]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find your uploaded assets</ErrorMessage>
  }

  return <AssetResults assets={assets} showCategory />
}

function SocialMediaEditor() {
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isSaving, hasSavedOrFailed, save] = useDatabaseSave(
    CollectionNames.Users,
    user && user.id
  )

  const [formFieldValues, setFormFieldValues] = useState({
    [UserFieldNames.discordUsername]: '',
    [UserFieldNames.twitterUsername]: '',
    [UserFieldNames.telegramUsername]: '',
    [UserFieldNames.youtubeChannelId]: ''
  })

  useEffect(() => {
    if (!user) {
      return
    }
    setFormFieldValues({
      [UserFieldNames.discordUsername]:
        user[UserFieldNames.discordUsername] || '',
      [UserFieldNames.twitterUsername]:
        user[UserFieldNames.twitterUsername] || '',
      [UserFieldNames.telegramUsername]:
        user[UserFieldNames.telegramUsername] || '',
      [UserFieldNames.youtubeChannelId]:
        user[UserFieldNames.youtubeChannelId] || ''
    })
  }, [user && user.id])

  const onSaveBtnClick = async () => {
    try {
      await save({
        ...formFieldValues,
        [UserFieldNames.lastModifiedBy]: userDocument,
        [UserFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
    }
  }

  const updateFormFieldValue = (name, newVal) =>
    setFormFieldValues({
      ...formFieldValues,
      [name]: newVal
    })

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  if (isErroredLoadingUser) {
    return <ErrorMessage>Failed to lookup your user details</ErrorMessage>
  }

  return (
    <>
      Discord username (eg. Peanut#1756):
      <TextField
        value={formFieldValues.discordUsername}
        onChange={e =>
          updateFormFieldValue(UserFieldNames.discordUsername, e.target.value)
        }
      />
      <br />
      Twitter username (without @ symbol eg. HiPeanutBuddha):
      <TextField
        value={formFieldValues.twitterUsername}
        onChange={e =>
          updateFormFieldValue(UserFieldNames.twitterUsername, e.target.value)
        }
      />
      <br />
      Telegram username (without @ symbol eg. PeanutBuddha):
      <TextField
        value={formFieldValues.telegramUsername}
        onChange={e =>
          updateFormFieldValue(UserFieldNames.telegramUsername, e.target.value)
        }
      />
      <br />
      YouTube channel ID (the last part of the URL after channel/ eg.
      https://www.youtube.com/channel/UCjb52a-oS48XP98GX1NSfsg):
      <TextField
        value={formFieldValues.youtubeChannelId}
        onChange={e =>
          updateFormFieldValue(UserFieldNames.youtubeChannelId, e.target.value)
        }
      />
      <br />
      {isSaving && 'Saving...'}
      {hasSavedOrFailed === true
        ? 'Success!'
        : hasSavedOrFailed === false
        ? 'Failed to save. Maybe try again?'
        : null}
      <Button onClick={onSaveBtnClick} isDisabled={isSaving}>
        Save
      </Button>
      <Button
        url={routes.viewUserWithVar.replace(':userId', user.id)}
        color="default">
        View Your Profile
      </Button>
    </>
  )
}

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve your account details</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Your Account</Heading>
      <BodyText>Hi, {user.username}!</BodyText>
      <Heading variant="h2">Change your name</Heading>
      <UsernameEditor />
      <Heading variant="h2">Profile settings</Heading>
      <AdultContentToggle />
      <br />
      <DarkModeToggle />
      <Heading variant="h2">Social Media</Heading>
      <p>These are shown to everyone on your profile.</p>
      <SocialMediaEditor />
      <Heading variant="h2">Your Uploads</Heading>
      <MyUploads />
    </>
  )
}
