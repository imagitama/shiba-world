import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'

import {
  AuthorFieldNames,
  CollectionNames,
  ProfileFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import Paper from '../paper'
import Heading from '../heading'

const useStyles = makeStyles(() => ({
  cols: {
    display: 'flex'
  },
  col: {
    width: '50%'
  }
}))

const fieldMap = [
  [ProfileFieldNames.bio, AuthorFieldNames.description],
  // AuthorFieldNames.websiteUrl,
  // AuthorFieldNames.email,
  [ProfileFieldNames.twitterUsername, AuthorFieldNames.twitterUsername],
  // AuthorFieldNames.gumroadUsername,
  [ProfileFieldNames.discordUsername, AuthorFieldNames.discordUsername],
  // AuthorFieldNames.discordServerInviteUrl,
  [ProfileFieldNames.patreonUsername, AuthorFieldNames.patreonUsername],
  [UserFieldNames.avatarUrl, AuthorFieldNames.avatarUrl]
]

// vrchatUserId: 'vrchatUserId',
// vrchatUsername: 'vrchatUsername',
// discordUsername: 'discordUsername',
// twitterUsername: 'twitterUsername',
// telegramUsername: 'telegramUsername',
// youtubeChannelId: 'youtubeChannelId',
// twitchUsername: 'twitchUsername',
// patreonUsername: 'patreonUsername',
// lastModifiedBy: 'lastModifiedBy',
// lastModifiedAt: 'lastModifiedAt',
// bio: 'bio'

export default ({ authorId, ownerId, onDone, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const titleRef = useRef()
  const [ownerFields, setOwnerFields] = useState({})
  const [newAuthorFields, setNewAuthorFields] = useState({})

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save synced author button')

      await save({
        ...newAuthorFields,
        [AuthorFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AuthorFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save author', err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save author</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Save successful!
        <br />
        <Button url={routes.viewAuthorWithVar.replace(':authorId', authorId)}>
          View Author
        </Button>
      </SuccessMessage>
    )
  }

  return (
    <>
      <div className={classes.cols}>
        <Paper className={classes.col}>
          <Heading variant="h2">Your Profile</Heading>
        </Paper>
        <div>
          <ArrowForwardIcon />
        </div>
        <Paper className={classes.col}>
          <Heading variant="h2">Author</Heading>
        </Paper>
      </div>
      <Paper>
        <Button onClick={onSaveBtnClick}>Save</Button>
      </Paper>
    </>
  )
}
