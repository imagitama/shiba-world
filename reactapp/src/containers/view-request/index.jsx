import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { Link } from 'react-router-dom'

import Markdown from '../../components/markdown'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import FormattedDate from '../../components/formatted-date'
import CommentList from '../../components/comment-list'
import AddCommentForm from '../../components/add-comment-form'
import ToggleRequestClosedButton from '../../components/toggle-request-closed-button'
import Button from '../../components/button'

import useDatabaseQuery, {
  CollectionNames,
  RequestsFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  container: {
    marginTop: '1rem'
  },
  message: {
    padding: '1rem',
    fontWeight: 'bold'
  },
  description: {
    padding: '1rem',
    '& p:first-child': {
      marginTop: 0
    },
    '& p:last-child': {
      marginBottom: 0
    }
  },
  title: {
    fontSize: '150%',
    marginBottom: '0.5rem'
  },
  meta: {
    marginTop: '1rem'
  }
})

function IsClosedMessage() {
  const classes = useStyles()
  return (
    <Paper className={classes.message}>This request has been closed.</Paper>
  )
}

function IsDeletedMessage() {
  const classes = useStyles()
  return (
    <Paper className={classes.message}>This request has been deleted.</Paper>
  )
}

function getCanUserEditRequest(request, user) {
  return (
    user &&
    (user[UserFieldNames.isEditor] ||
      user[UserFieldNames.isAdmin] ||
      user.id === request[RequestsFieldNames.createdBy].id)
  )
}

function RequestEditor({ request, onDone }) {
  const requestId = request.id
  const userId = useFirebaseUserId()
  const classes = useStyles()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Requests,
    requestId
  )
  const [fieldData, setFieldData] = useState(request)

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save the request</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Saved successfully
        <br />
        <br />
        <Button
          onClick={() => {
            onDone()
            trackAction(
              'ViewRequest',
              'Click dismiss saved successfully button',
              requestId
            )
          }}>
          Dismiss
        </Button>
      </SuccessMessage>
    )
  }

  const onFieldChange = (fieldName, newValue) =>
    setFieldData({
      ...fieldData,
      [fieldName]: newValue
    })

  const onSaveBtnClick = async () => {
    trackAction('ViewRequest', 'Click save button', requestId)

    // TODO: Output these invalid fields to user
    if (
      !fieldData[RequestsFieldNames.title] ||
      !fieldData[RequestsFieldNames.description]
    ) {
      return false
    }

    try {
      await save({
        ...fieldData,
        [RequestsFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [RequestsFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to edit request', err)
      handleError(err)
    }
  }

  return (
    <>
      <Heading variant="h1">
        <TextField
          // TODO: Use classes
          style={{ width: '100%' }}
          onChange={e =>
            onFieldChange(RequestsFieldNames.title, e.target.value)
          }
          value={fieldData[RequestsFieldNames.title]}
        />
      </Heading>
      <Paper className={classes.description}>
        <TextField
          multiline
          rows={10}
          style={{ width: '100%' }}
          onChange={e =>
            onFieldChange(RequestsFieldNames.description, e.target.value)
          }
          value={fieldData[RequestsFieldNames.description]}
        />
      </Paper>
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}

function RequestOverview({ request: { id, title, description } }) {
  const classes = useStyles()
  return (
    <>
      <Heading variant="h1">
        <Link to={routes.viewRequestWithVar.replace(':requestId', id)}>
          {title}
        </Link>
      </Heading>
      <Paper className={classes.description}>
        <Markdown source={description} />
      </Paper>
    </>
  )
}

export default ({
  match: {
    params: { requestId }
  }
}) => {
  const classes = useStyles()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Requests,
    requestId
  )
  const [, , user] = useUserRecord()
  const [isInEditMode, setIsInEditMode] = useState(false)

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get request</ErrorMessage>
  }

  if (!result.title) {
    return <ErrorMessage>Request does not exist</ErrorMessage>
  }

  const {
    title,
    description,
    createdAt,
    createdBy,
    isClosed,
    [RequestsFieldNames.isDeleted]: isDeleted
  } = result

  return (
    <>
      <Helmet>
        <title>
          {title} | Created by {createdBy.username} | VRCArena
        </title>
        <meta name="description" content={description} />
      </Helmet>
      {isClosed && <IsClosedMessage />}
      {isDeleted && <IsDeletedMessage />}
      {isInEditMode ? (
        <RequestEditor request={result} onDone={() => setIsInEditMode(false)} />
      ) : (
        <RequestOverview request={result} />
      )}
      <div className={classes.meta}>
        Created by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
          {createdBy.username}
        </Link>{' '}
        <FormattedDate date={createdAt} />
      </div>
      {getCanUserEditRequest(result, user) && (
        <div>
          <ToggleRequestClosedButton
            requestId={requestId}
            onClick={({ newValue }) =>
              trackAction(
                'ViewRequest',
                newValue === true
                  ? 'Click close button'
                  : 'Click unclose button',
                requestId
              )
            }
          />{' '}
          <Button
            onClick={() => {
              const newValue = !isInEditMode
              setIsInEditMode(newValue)
              trackAction(
                'ViewRequest',
                newValue === true
                  ? 'Click edit button'
                  : 'Click stop editing button',
                requestId
              )
            }}>
            Toggle Edit
          </Button>
        </div>
      )}
      <Heading variant="h2">Responses</Heading>
      <CommentList
        collectionName={CollectionNames.Requests}
        parentId={requestId}
      />
      <Heading variant="h2">Add Response</Heading>
      <AddCommentForm
        collectionName={CollectionNames.Requests}
        parentId={requestId}
      />
    </>
  )
}
