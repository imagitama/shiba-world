import React from 'react'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import DeleteIcon from '@material-ui/icons/Delete'

import * as routes from '../../routes'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import FormattedDate from '../formatted-date'
import Button from '../button'
import { canEditComments } from '../../permissions'
import {
  CollectionNames,
  CommentFieldNames
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  root: {
    marginBottom: '1rem',
    position: 'relative'
  },
  content: {
    '& p:first-child': {
      marginTop: 0
    },
    '& p:last-child': {
      marginBottom: 0
    }
  },
  deletedMessage: {
    fontStyle: 'italic'
  }
})

function DeleteButton({ commentId, isDeleted }) {
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isError, save] = useDatabaseSave(
    CollectionNames.Comments,
    commentId
  )

  const onBtnClick = async () => {
    try {
      const newVal = !isDeleted

      await save({
        [CommentFieldNames.isDeleted]: newVal,
        [CommentFieldNames.lastModifiedAt]: new Date(),
        [CommentFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return 'Deleting...'
  }

  if (isSuccess) {
    return 'Saved!'
  }

  if (isError) {
    return 'Failed!'
  }

  return (
    <Button onClick={onBtnClick} icon={<DeleteIcon />} color="default">
      {isDeleted ? 'Restore' : 'Delete'}
    </Button>
  )
}

export default ({
  comment: {
    id,
    comment,
    createdBy,
    createdAt,
    [CommentFieldNames.isDeleted]: isDeleted
  }
}) => {
  const [, , user] = useUserRecord()
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <div className={classes.container} title={id}>
        <CardContent className={classes.content}>
          {isDeleted && (
            <span className={classes.deletedMessage}>
              This comment has been deleted.
            </span>
          )}
          {!isDeleted || canEditComments(user) ? (
            <Markdown source={comment} />
          ) : null}
          <Typography variant="body2" color="textSecondary" component="p">
            <FormattedDate date={createdAt} /> by{' '}
            <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
              {createdBy.username}
            </Link>
          </Typography>
          {canEditComments(user) && (
            <div className={classes.controls}>
              <DeleteButton commentId={id} isDeleted={isDeleted} />
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
