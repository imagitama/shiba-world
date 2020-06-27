import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'

import useDatabaseQuery, {
  CollectionNames,
  ProfileFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'

import { handleError } from '../../error-handling'

export default () => {
  const userId = useFirebaseUserId()
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId
  )
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [isSaving, hasSavedOrFailed, save] = useDatabaseSave(
    CollectionNames.Profiles,
    userId
  )

  const [formFieldValues, setFormFieldValues] = useState({
    [ProfileFieldNames.vrchatUsername]: '',
    [ProfileFieldNames.discordUsername]: '',
    [ProfileFieldNames.twitterUsername]: '',
    [ProfileFieldNames.telegramUsername]: '',
    [ProfileFieldNames.youtubeChannelId]: '',
    [ProfileFieldNames.twitchUsername]: ''
  })

  useEffect(() => {
    if (!profile) {
      return
    }
    setFormFieldValues({
      [ProfileFieldNames.vrchatUsername]:
        profile[ProfileFieldNames.vrchatUsername] || '',
      [ProfileFieldNames.discordUsername]:
        profile[ProfileFieldNames.discordUsername] || '',
      [ProfileFieldNames.twitterUsername]:
        profile[ProfileFieldNames.twitterUsername] || '',
      [ProfileFieldNames.telegramUsername]:
        profile[ProfileFieldNames.telegramUsername] || '',
      [ProfileFieldNames.youtubeChannelId]:
        profile[ProfileFieldNames.youtubeChannelId] || '',
      [ProfileFieldNames.twitchUsername]:
        profile[ProfileFieldNames.twitchUsername] || ''
    })
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      await save({
        ...formFieldValues,
        [ProfileFieldNames.lastModifiedBy]: userDocument,
        [ProfileFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
      handleError(err)
    }
  }

  const updateFormFieldValue = (name, newVal) =>
    setFormFieldValues({
      ...formFieldValues,
      [name]: newVal
    })

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (isErroredLoadingProfile) {
    return <ErrorMessage>Failed to lookup your user profile</ErrorMessage>
  }

  return (
    <>
      VRChat username (eg. PeanutBuddha):
      <TextField
        value={formFieldValues.vrchatUsername}
        onChange={e =>
          updateFormFieldValue(ProfileFieldNames.vrchatUsername, e.target.value)
        }
      />
      <br />
      Discord username (eg. Peanut#1756):
      <TextField
        value={formFieldValues.discordUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.discordUsername,
            e.target.value
          )
        }
      />
      <br />
      Twitter username (without @ symbol eg. HiPeanutBuddha):
      <TextField
        value={formFieldValues.twitterUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.twitterUsername,
            e.target.value
          )
        }
      />
      <br />
      Telegram username (without @ symbol eg. PeanutBuddha):
      <TextField
        value={formFieldValues.telegramUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.telegramUsername,
            e.target.value
          )
        }
      />
      <br />
      YouTube channel ID (the last part of the URL after channel/ eg.
      https://www.youtube.com/channel/UCjb52a-oS48XP98GX1NSfsg):
      <TextField
        value={formFieldValues.youtubeChannelId}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.youtubeChannelId,
            e.target.value
          )
        }
      />
      <br />
      Twitch username:
      <TextField
        value={formFieldValues.twitchUsername}
        onChange={e =>
          updateFormFieldValue(ProfileFieldNames.twitchUsername, e.target.value)
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
    </>
  )
}
