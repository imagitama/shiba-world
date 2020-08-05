import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  ProfileFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  label: {
    marginTop: '1rem',
    fontWeight: 'bold'
  },
  hint: {
    fontStyle: 'italic',
    fontSize: '75%',
    marginTop: '0.5rem'
  },
  controls: {
    marginTop: '2rem'
  }
})

const Label = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const Hint = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.hint}>{children}</div>
}

export default ({ onSaveClick = null }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Profiles,
    userId
  )

  const [formFieldValues, setFormFieldValues] = useState({
    [ProfileFieldNames.vrchatUserId]: '',
    [ProfileFieldNames.vrchatUsername]: '',
    [ProfileFieldNames.discordUsername]: '',
    [ProfileFieldNames.twitterUsername]: '',
    [ProfileFieldNames.telegramUsername]: '',
    [ProfileFieldNames.youtubeChannelId]: '',
    [ProfileFieldNames.twitchUsername]: '',
    [ProfileFieldNames.patreonUsername]: ''
  })

  useEffect(() => {
    if (!profile) {
      return
    }
    setFormFieldValues({
      [ProfileFieldNames.vrchatUserId]:
        profile[ProfileFieldNames.vrchatUserId] || '',
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
        profile[ProfileFieldNames.twitchUsername] || '',
      [ProfileFieldNames.patreonUsername]:
        profile[ProfileFieldNames.patreonUsername] || ''
    })
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      await save({
        ...formFieldValues,
        [ProfileFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
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
      <Label>VRChat User ID</Label>
      <TextField
        value={formFieldValues.vrchatUserId}
        onChange={e =>
          updateFormFieldValue(ProfileFieldNames.vrchatUserId, e.target.value)
        }
      />
      <Hint>
        To find your ID, log in to VRChat website, click your username and your
        ID is https://vrchat.com/home/user/[YOUR_ID]
      </Hint>
      <Label>VRChat Username</Label>
      <TextField
        value={formFieldValues.vrchatUsername}
        onChange={e =>
          updateFormFieldValue(ProfileFieldNames.vrchatUsername, e.target.value)
        }
      />
      <Hint>For display purposes only.</Hint>
      <Label>Discord username</Label>
      <TextField
        value={formFieldValues.discordUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.discordUsername,
            e.target.value
          )
        }
      />
      <Hint>eg. MyName#1234</Hint>
      <Label>Twitter username</Label>
      <TextField
        value={formFieldValues.twitterUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.twitterUsername,
            e.target.value
          )
        }
      />
      <Hint>Without the @ symbol eg. MyTwitterName</Hint>
      <Label>Telegram username</Label>
      <TextField
        value={formFieldValues.telegramUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.telegramUsername,
            e.target.value
          )
        }
      />
      <Hint>Without @ symbol eg. MyTelegramUsername</Hint>
      <Label>YouTube channel ID</Label>
      <TextField
        value={formFieldValues.youtubeChannelId}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.youtubeChannelId,
            e.target.value
          )
        }
      />
      <Hint>
        Get your channel ID by visiting your channel and in the address bar it
        is https://www.youtube.com/channel/[YOUR_ID]
      </Hint>
      <Label>Twitch username</Label>
      <TextField
        value={formFieldValues.twitchUsername}
        onChange={e =>
          updateFormFieldValue(ProfileFieldNames.twitchUsername, e.target.value)
        }
      />
      <Label>Patreon username</Label>
      <TextField
        value={formFieldValues.patreonUsername}
        onChange={e =>
          updateFormFieldValue(
            ProfileFieldNames.patreonUsername,
            e.target.value
          )
        }
      />
      <Hint>The name in the URL like https://patreon.com/[username]</Hint>
      <div className={classes.controls}>
        {isSaving && 'Saving...'}
        {isSaveSuccess
          ? 'Success!'
          : isSaveError
          ? 'Failed to save. Maybe try again?'
          : null}
        <Button onClick={onSaveBtnClick} isDisabled={isSaving}>
          Save
        </Button>
      </div>
    </>
  )
}
