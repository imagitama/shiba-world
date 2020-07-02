import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'

import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import FormattedDate from '../../components/formatted-date'
import CommentList from '../../components/comment-list'
import AddCommentForm from '../../components/add-comment-form'
import ToggleIsClosedButton from '../../components/toggle-request-closed-button'
import Button from '../../components/button'

import useDatabaseQuery, {
  CollectionNames,
  RequestsFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { trackAction, actions } from '../../analytics'

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

function getCanUserEditRequest(request, user) {
  return (
    user && (user.isEditor || user.isAdmin || user.id === request.createdBy.id)
  )
}

function RequestEditor({ request, onDone }) {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isSaving, wasSaveSuccessOrFail, save] = useDatabaseSave(
    CollectionNames.Requests,
    request.id
  )
  const [fieldData, setFieldData] = useState(request)

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (wasSaveSuccessOrFail === false) {
    return <ErrorMessage>Failed to save the request</ErrorMessage>
  }

  if (wasSaveSuccessOrFail === true) {
    return (
      <SuccessMessage>
        Saved successfully
        <br />
        <br />
        <Button
          onClick={() => {
            onDone()
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
    if (
      !fieldData[RequestsFieldNames.title] ||
      !fieldData[RequestsFieldNames.description]
    ) {
      return false
    }

    try {
      await save({
        ...fieldData,
        [RequestsFieldNames.isClosed]: false,
        [RequestsFieldNames.lastModifiedBy]: userDocument,
        [RequestsFieldNames.lastModifiedAt]: new Date()
      })

      trackAction(actions.EDIT_REQUEST, {
        requestId: request.id,
        userId: user.id
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

  const { id, title, description, createdAt, createdBy, isClosed } = result

  return (
    <>
      <Helmet>
        <title>
          {title} | Created by {createdBy.username} | VRCArena
        </title>
        <meta name="description" content={description} />
      </Helmet>
      {isClosed && <IsClosedMessage />}
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
          <ToggleIsClosedButton requestId={id} />{' '}
          <Button onClick={() => setIsInEditMode(!isInEditMode)}>
            Toggle Edit
          </Button>
        </div>
      )}
      <Heading variant="h2">Responses</Heading>
      <CommentList collectionName={CollectionNames.Requests} parentId={id} />
      <Heading variant="h2">Add Response</Heading>
      <AddCommentForm collectionName={CollectionNames.Requests} parentId={id} />
    </>
  )
}
