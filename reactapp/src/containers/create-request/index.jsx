import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import TextField from '@material-ui/core/TextField'

import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import SuccessMessage from '../../components/success-message'
import LoadingIndicator from '../../components/loading-indicator'
import Button from '../../components/button'
import Heading from '../../components/heading'

import {
  CollectionNames,
  RequestsFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

export default () => {
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Requests
  )
  const [fieldData, setFieldData] = useState({
    [RequestsFieldNames.title]: '',
    [RequestsFieldNames.description]: ''
  })
  const [createdDocId, setCreatedDocId] = useState(null)

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isSaving) {
    return <LoadingIndicator />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to create the request</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Request created successfully
        <br />
        <br />
        <Button
          url={routes.viewRequestWithVar.replace(':requestId', createdDocId)}
          onClick={() =>
            trackAction(
              'CreateRequest',
              'Click view created request button',
              createdDocId
            )
          }>
          View Request
        </Button>
      </SuccessMessage>
    )
  }

  const onFieldChange = (fieldName, newValue) =>
    setFieldData({
      ...fieldData,
      [fieldName]: newValue
    })

  const onCreateBtnClick = async () => {
    trackAction('CreateRequest', 'Click create button')

    // TODO: Output this invalid data to user
    if (
      !fieldData[RequestsFieldNames.title] ||
      !fieldData[RequestsFieldNames.description]
    ) {
      return false
    }

    try {
      const [newDocId] = await save({
        ...fieldData,
        // Need to populate these for queries later
        [RequestsFieldNames.isDeleted]: false,
        [RequestsFieldNames.createdBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [RequestsFieldNames.createdAt]: new Date()
      })

      setCreatedDocId(newDocId)
    } catch (err) {
      console.error('Failed to create request', err)
      handleError(err)
    }
  }

  return (
    <>
      <Helmet>
        <title>Create a new request | VRCArena</title>
        <meta
          name="description"
          content="Use this form to create a new request for a new asset."
        />
      </Helmet>
      <Heading variant="h1">Create Request</Heading>
      Title:
      <br />
      <TextField
        // TODO: Replace with classes
        style={{ width: '100%' }}
        onChange={e => onFieldChange(RequestsFieldNames.title, e.target.value)}
        value={fieldData[RequestsFieldNames.title]}
      />
      <br />
      <br />
      Description:
      <br />
      <TextField
        multiline
        rows={10}
        style={{ width: '100%' }}
        onChange={e =>
          onFieldChange(RequestsFieldNames.description, e.target.value)
        }
        value={fieldData[RequestsFieldNames.description]}
      />
      <br />
      You can use markdown.
      <br />
      <br />
      <Button onClick={onCreateBtnClick}>Create</Button>
    </>
  )
}
