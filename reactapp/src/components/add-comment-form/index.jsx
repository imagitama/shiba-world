import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { trackAction, actions } from '../../analytics'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import Message from '../message'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  root: {
    marginTop: '1rem'
  },
  input: {
    width: '100%'
  },
  button: {
    marginTop: '0.5rem'
  }
})

export default ({ collectionName, parentId }) => {
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
      const [documentId] = await save({
        parent: createRef(collectionName, parentId),
        comment: textFieldValue,
        createdBy: createRef(CollectionNames.Users, userId),
        createdAt: new Date()
      })

      trackAction(actions.CREATE_COMMENT, {
        parentId: documentId,
        userId
      })
    } catch (err) {
      console.error('Failed to add comment', err)
      handleError(err)
    }
  }

  return (
    <div className={classes.root}>
      <TextField
        className={classes.input}
        label="Your comment"
        multiline
        value={textFieldValue}
        onChange={event => setTextFieldValue(event.target.value)}
        rows={5}
        variant="filled"
      />
      <Button className={classes.button} onClick={onAddCommentBtnClick}>
        Add Comment
      </Button>
    </div>
  )
}
