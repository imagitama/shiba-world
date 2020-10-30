import React from 'react'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import {
  CollectionNames,
  CommentFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'

import FormattedDate from '../formatted-date'
import Button from '../button'
import Avatar from '../avatar'
import LikeButton from '../like-button'
import LikesTotal from '../likes-total'

import { canEditComments } from '../../permissions'
import * as routes from '../../routes'
import { createRef, isFallbackImageDefinition } from '../../utils'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  cols: {
    marginBottom: '1rem',
    position: 'relative',
    display: 'flex'
  },
  deleted: {
    opacity: '0.5'
  },
  colLeft: {
    width: '50px',
    marginRight: '0.5rem'
  },
  colRight: {
    flex: 1
  },
  content: {
    marginTop: '0.25rem',
    flex: 1,
    '& p:first-child': {
      marginTop: 0
    },
    '& p:last-child': {
      marginBottom: 0
    }
  },
  deletedMessage: {
    fontStyle: 'italic'
  },
  date: {},
  contentWrapper: {
    display: 'flex'
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  control: {},
  meta: {
    display: 'inline-block'
  },
  metaItems: {
    marginLeft: '0.25rem',
    fontSize: '75%',
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      display: 'inline-block',
      marginRight: '1rem'
    }
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
    <div
      className={`${classes.cols} ${isDeleted ? classes.deleted : ''}`}
      title={id}>
      <div className={classes.colLeft}>
        <Avatar
          url={
            createdBy[UserFieldNames.avatarUrl]
              ? isFallbackImageDefinition(createdBy[UserFieldNames.avatarUrl])
                ? createdBy[UserFieldNames.avatarUrl].url
                : createdBy[UserFieldNames.avatarUrl]
              : null
          }
          fallbackUrl={
            createdBy[UserFieldNames.avatarUrl] &&
            isFallbackImageDefinition(createdBy[UserFieldNames.avatarUrl])
              ? createdBy[UserFieldNames.avatarUrl].fallbackUrl
              : null
          }
          size={null}
        />
      </div>
      <div className={classes.colRight}>
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
          {createdBy.username}
        </Link>{' '}
        <div className={classes.meta}>
          <div className={classes.metaItems}>
            <div className={classes.date}>
              <FormattedDate date={createdAt} />
            </div>
            <div className={classes.likeButton}>
              <LikeButton
                collectionName={CollectionNames.Comments}
                parentId={id}
              />
            </div>
            <div>
              <LikesTotal
                collectionName={CollectionNames.Comments}
                parentId={id}
              />
            </div>
          </div>
        </div>
        <div className={classes.contentWrapper}>
          {isDeleted && (
            <div className={classes.deletedMessage}>
              This comment has been deleted.
            </div>
          )}
          {!isDeleted || canEditComments(user) ? (
            <div className={classes.content}>
              <Markdown source={comment} />
            </div>
          ) : null}
          {canEditComments(user) && (
            <div className={classes.controls}>
              <div className={classes.control}>
                <DeleteButton commentId={id} isDeleted={isDeleted} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
