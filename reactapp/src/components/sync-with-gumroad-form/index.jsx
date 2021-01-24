import React, { useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Markdown from 'react-markdown'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'

import Button from '../button'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'

import { handleError } from '../../error-handling'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

const useStyles = makeStyles({
  field: {
    width: '100%'
  }
})

const getCodeFromGumroadUrl = url => {
  if (!url) {
    return ''
  }
  return url
    .split('?')[0]
    .split('/')
    .pop()
}

const getFieldsToSave = (fields, whichFieldsAreEnabled) => {
  const fieldsToSave = {}

  for (const fieldName in fields) {
    if (whichFieldsAreEnabled[fieldName]) {
      fieldsToSave[fieldName] = fields[fieldName]
    }
  }

  return fieldsToSave
}

const addQuotesToDescription = desc => {
  return desc
    .split('\n')
    .map(line => `> ${line}`)
    .join('\n')
}

export default ({ assetId, gumroadUrl, onDone }) => {
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchError, setIsFetchError] = useState(false)
  const [newFields, setNewFields] = useState({})
  const [whichFieldsAreEnabled, setWhichFieldsAreEnabled] = useState({
    [AssetFieldNames.title]: true,
    [AssetFieldNames.description]: true
  })
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [isUsingQuotes, setIsUsingQuotes] = useState(false)

  const populateFromGumroad = async () => {
    try {
      setIsFetching(true)
      setIsFetchError(false)

      const code = getCodeFromGumroadUrl(gumroadUrl)

      if (!code) {
        throw new Error(`Invalid Gumroad URL: ${gumroadUrl}`)
      }

      const {
        data: { name, descriptionMarkdown }
      } = await callFunction('fetchGumroadInfo', {
        code
      })

      setIsFetching(false)
      setIsFetchError(false)
      setNewFields({
        [AssetFieldNames.title]: name,
        [AssetFieldNames.description]: descriptionMarkdown
      })
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsFetching(false)
      setIsFetchError(true)
    }
  }

  useEffect(() => {
    populateFromGumroad()
  }, [gumroadUrl])

  const onSaveBtnClick = async () => {
    try {
      await save({
        ...getFieldsToSave(newFields, whichFieldsAreEnabled),
        lastModifiedBy: createRef(CollectionNames.Users, userId),
        lastModifiedAt: new Date()
      })
    } catch (err) {
      console.error('Failed to save asset', err)
      handleError(err)
    }
  }

  const updateField = (fieldName, newValue) =>
    setNewFields({
      ...newFields,
      [fieldName]: newValue
    })

  const toggleIsFieldEnabled = fieldName =>
    setWhichFieldsAreEnabled({
      ...whichFieldsAreEnabled,
      [fieldName]: !whichFieldsAreEnabled[fieldName]
    })

  if (isFetching) {
    return <LoadingIndicator>Fetching from Gumroad...</LoadingIndicator>
  }

  if (isSaving) {
    return <LoadingIndicator>Saving...</LoadingIndicator>
  }

  if (isSuccess) {
    return (
      <SuccessMessage>
        Asset has been saved <Button onClick={onDone}>Done</Button>
      </SuccessMessage>
    )
  }

  if (isErrored) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  if (isFetchError) {
    return (
      <ErrorMessage>
        Failed to fetch from Gumroad
        <br />
        <br />
        <Button onClick={populateFromGumroad}>Try Again</Button>
      </ErrorMessage>
    )
  }

  return (
    <Paper>
      Title
      <Checkbox
        checked={whichFieldsAreEnabled[AssetFieldNames.title]}
        onClick={() => toggleIsFieldEnabled(AssetFieldNames.title)}
      />
      <br />
      <TextField
        value={newFields[AssetFieldNames.title]}
        onChange={e => updateField(AssetFieldNames.title, e.target.value)}
        className={classes.field}
      />
      <hr />
      Description
      <Checkbox
        checked={whichFieldsAreEnabled[AssetFieldNames.description]}
        onClick={() => toggleIsFieldEnabled(AssetFieldNames.description)}
      />
      <br />
      <TextField
        value={newFields[AssetFieldNames.description]}
        onChange={e => updateField(AssetFieldNames.title, e.target.value)}
        multiline
        rows={10}
        className={classes.field}
      />
      <Markdown source={newFields[AssetFieldNames.description]} />
      <hr />
      <Checkbox
        checked={isUsingQuotes}
        onClick={() => {
          updateField(
            AssetFieldNames.description,
            addQuotesToDescription(newFields[AssetFieldNames.description])
          )
          setIsUsingQuotes(!isUsingQuotes)
        }}
      />{' '}
      Add quote symbols to description (recommended)
      <hr />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </Paper>
  )
}
