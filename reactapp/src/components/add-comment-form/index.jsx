import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '../button'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import { trackAction, actions } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import ErrorMessage from '../error-message'
import SuccessMessage from '../success-message'
import LoadingIndicator from '../loading-indicator'

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
  const [, , user] = useUserRecord()
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Comments
  )
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [parentDoc] = useDatabaseDocument(collectionName, parentId)
  const classes = useStyles()

  if (!user) {
    return 'You must be logged in'
  }

  if (isSaving) {
    return <LoadingIndicator>Adding your comment...</LoadingIndicator>
  }

  if (didSaveSucceedOrFail === true) {
    return <SuccessMessage>Added your comment successfully</SuccessMessage>
  }

  if (didSaveSucceedOrFail === false) {
    return (
      <ErrorMessage>Error adding your comment. Please try again.</ErrorMessage>
    )
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
      <Button
        className={classes.button}
        onClick={async () => {
          const [documentId] = await save({
            parent: parentDoc,
            comment: textFieldValue,
            createdBy: userDocument,
            createdAt: new Date()
          })

          trackAction(actions.CREATE_COMMENT, {
            parentId: documentId,
            userId: user.id
          })
        }}>
        Add Comment
      </Button>
    </div>
  )
}
