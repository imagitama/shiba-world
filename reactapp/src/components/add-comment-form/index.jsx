import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import {
  CollectionNames,
  CommentFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Message from '../message'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { searchIndexNames } from '../../modules/app'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem'
  },
  input: {
    width: '100%'
  },
  button: {
    marginTop: '0.5rem'
  },
  tagHint: {
    fontSize: '75%'
  }
})

function UserList({ searchTerm, onClickUser }) {
  const [isSearching, isErrored, results] = useAlgoliaSearch(
    searchIndexNames.USERS,
    searchTerm
  )

  if (isSearching) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to search users</ErrorMessage>
  }

  if (!results || !results.length) {
    return <ErrorMessage>No results</ErrorMessage>
  }

  return (
    <ul>
      {results.map(result => (
        <li
          key={result.objectID}
          onClick={() => onClickUser(result.objectID, result.username)}>
          {result.username}
        </li>
      ))}
    </ul>
  )
}

function getSearchTerm(text) {
  // Check if there are spaces as that is how we know the search is "complete"
  if (!text || !text.includes('@') || text.includes(' ')) {
    return ''
  }

  const chunks = text.split('@')

  return chunks[1]
}

export default ({ collectionName, parentId, onAddClick = null }) => {
  if (!collectionName) {
    throw new Error('Cannot render comment list: no collection name!')
  }
  if (!parentId) {
    throw new Error('Cannot render comment list: no parent ID')
  }

  const [textFieldValue, setTextFieldValue] = useState('')
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Comments
  )
  const classes = useStyles()

  if (!userId) {
    return <Message>You must be logged in to comment</Message>
  }

  if (isSaving) {
    return <LoadingIndicator>Adding your comment...</LoadingIndicator>
  }

  if (isSuccess) {
    return <SuccessMessage>Added your comment successfully</SuccessMessage>
  }

  if (isErrored) {
    return (
      <ErrorMessage>Error adding your comment. Please try again.</ErrorMessage>
    )
  }

  const onAddCommentBtnClick = async () => {
    try {
      if (onAddClick) {
        onAddClick()
      }

      await save({
        [CommentFieldNames.parent]: createRef(collectionName, parentId),
        [CommentFieldNames.comment]: textFieldValue,
        [CommentFieldNames.isDeleted]: false,
        [CommentFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [CommentFieldNames.createdAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to add comment', err)
      handleError(err)
    }
  }

  const userSearchTerm = getSearchTerm(textFieldValue)

  const onClickUser = (userId, username) => {
    setTextFieldValue(textFieldValue.replace(userSearchTerm, username))
  }

  return (
    <div className={classes.root}>
      <span className={classes.tagHint}>
        Start your message with @ and you can tag a user which will notify them
        of your comment (does not support usernames with spaces)
        <br />
        <strong>
          Do not tag the{' '}
          {collectionName === CollectionNames.Users
            ? 'user you are commenting on'
            : 'author or creator of the asset'}{' '}
          as they are notified of your comment (if they choose to get
          notifications).
        </strong>
      </span>
      <TextField
        className={classes.input}
        label="Your comment"
        multiline
        value={textFieldValue}
        onChange={event => setTextFieldValue(event.target.value)}
        rows={5}
        variant="filled"
      />
      {userSearchTerm && (
        <UserList searchTerm={userSearchTerm} onClickUser={onClickUser} />
      )}
      <Button className={classes.button} onClick={onAddCommentBtnClick}>
        Add Comment
      </Button>
    </div>
  )
}
