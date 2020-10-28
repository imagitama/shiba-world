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
  field: {
    width: '100%',
    display: 'flex',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  label: {
    marginTop: '1rem',
    fontWeight: 'bold',
    width: '25%',
    flexShrink: 0
  },
  input: {
    flex: 1,
    '& > div': {
      width: '100%'
    },
    '& input': {
      paddingTop: '12px'
    }
  },
  hint: {
    fontSize: '75%',
    marginTop: '0.5rem',
    opacity: '0.75'
  },
  controls: {
    marginTop: '2rem'
  }
})

const Label = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.label}>{children}</div>
}

const Input = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.input}>{children}</div>
}

const Hint = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.hint}>{children}</div>
}

const Field = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.field}>{children}</div>
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
      <Field>
        <Label>VRChat User ID</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.vrchatUserId}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.vrchatUserId,
                e.target.value
              )
            }
          />
          <Hint>
            To find your ID, log in to VRChat website, click your username and
            your ID is https://vrchat.com/home/user/[YOUR_ID]
            <br />
          </Hint>
        </Input>
      </Field>
      <Field>
        <Label>VRChat Username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.vrchatUsername}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.vrchatUsername,
                e.target.value
              )
            }
          />
          <Hint>For display purposes only.</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Discord username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.discordUsername}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.discordUsername,
                e.target.value
              )
            }
          />
          <Hint>eg. MyName#1234</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Twitter username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.twitterUsername}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.twitterUsername,
                e.target.value
              )
            }
          />
          <Hint>Without the @ symbol eg. MyTwitterName</Hint>
        </Input>
      </Field>
      <Field>
        <Label>Telegram username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.telegramUsername}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.telegramUsername,
                e.target.value
              )
            }
          />
          <Hint>Without @ symbol eg. MyTelegramUsername</Hint>
        </Input>
      </Field>
      <Field>
        <Label>YouTube channel ID</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.youtubeChannelId}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.youtubeChannelId,
                e.target.value
              )
            }
          />
          <Hint>
            Get your channel ID by visiting your channel and in the address bar
            it is https://www.youtube.com/channel/[YOUR_ID]
          </Hint>
        </Input>
      </Field>
      <Field>
        <Label>Twitch username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.twitchUsername}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.twitchUsername,
                e.target.value
              )
            }
          />
        </Input>
      </Field>
      <Field>
        <Label>Patreon username</Label>
        <Input>
          <TextField
            variant="filled"
            value={formFieldValues.patreonUsername}
            onChange={e =>
              updateFormFieldValue(
                ProfileFieldNames.patreonUsername,
                e.target.value
              )
            }
          />
          <Hint>The name in the URL like https://patreon.com/[username]</Hint>
        </Input>
      </Field>
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
