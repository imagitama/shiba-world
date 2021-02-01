import React, { useEffect, useState } from 'react'
import TextField from '@material-ui/core/TextField'
import Markdown from 'react-markdown'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import shortid from 'shortid'

import Button from '../button'
import ErrorMessage from '../error-message'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'

import { handleError } from '../../error-handling'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import OptimizedImageUploader from '../optimized-image-uploader'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, paths } from '../../config'
import { addQuotesToDescription } from '../../utils/formatting'

const useStyles = makeStyles({
  field: {
    width: '100%'
  },
  row: {
    marginBottom: '0.5rem'
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
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

const isValidPreviewImageUrl = url => {
  if (!url) {
    return false
  }
  if (url.indexOf('.gif') !== -1) {
    return false
  }
  return true
}

const getImageUrlAsFile = async url => {
  const resp = await fetch(url)
  const blob = await resp.blob()
  const fileExt = url
    .split('?')[0]
    .split('/')
    .pop()
    .split('.')[1]
  const filename = `my-gumroad-image.${fileExt}`
  const file = new File([blob], filename, blob)
  console.debug(`Got image url "${url}" as file "${filename}"`)
  return file
}

export default ({ assetId, gumroadUrl, onDone }) => {
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchError, setIsFetchError] = useState(false)
  const [newFields, setNewFields] = useState({})
  const [whichFieldsAreEnabled, setWhichFieldsAreEnabled] = useState({
    [AssetFieldNames.title]: true,
    [AssetFieldNames.description]: true,
    [AssetFieldNames.thumbnailUrl]: true
  })
  const userId = useFirebaseUserId()
  const [isSaving, , isErrored, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [isUsingQuotes, setIsUsingQuotes] = useState(true)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewImageFile, setPreviewImageFile] = useState(null)

  const populateFromGumroad = async () => {
    try {
      setIsFetching(true)
      setIsFetchError(false)

      const code = getCodeFromGumroadUrl(gumroadUrl)

      if (!code) {
        throw new Error(`Invalid Gumroad URL: ${gumroadUrl}`)
      }

      const {
        data: { name, descriptionMarkdown, ourPreviewUrl }
      } = await callFunction('fetchGumroadInfo', {
        code
      })

      setIsFetching(false)
      setIsFetchError(false)
      setNewFields({
        [AssetFieldNames.title]: name,
        [AssetFieldNames.description]: descriptionMarkdown
      })

      if (isValidPreviewImageUrl(ourPreviewUrl)) {
        const file = await getImageUrlAsFile(ourPreviewUrl)
        setPreviewImageFile(file)
        setPreviewImageUrl(ourPreviewUrl)
      }
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

      // note: on save this component is re-mounted so cannot rely on isSuccess
      onDone()
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
    return <LoadingIndicator message="Fetching from Gumroad..." />
  }

  if (isSaving) {
    return <LoadingIndicator>Saving...</LoadingIndicator>
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
    <>
      <Paper className={classes.row}>
        Thumbnail
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.thumbnailUrl)}
        />
        {isValidPreviewImageUrl(previewImageUrl) ? (
          <OptimizedImageUploader
            preloadImageUrl={previewImageUrl}
            preloadFile={previewImageFile}
            requiredWidth={THUMBNAIL_WIDTH}
            requiredHeight={THUMBNAIL_HEIGHT}
            onUploadedUrl={url =>
              updateField(AssetFieldNames.thumbnailUrl, url)
            }
            directoryPath={paths.assetThumbnailDir}
            filePrefix={shortid.generate()}
          />
        ) : (
          'Image cannot be used as a thumbnail (eg. it is .gif)'
        )}
      </Paper>
      <Paper className={classes.row}>
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
      </Paper>
      <Paper className={classes.row}>
        Description
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.description]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.description)}
        />
        <br />
        <TextField
          value={newFields[AssetFieldNames.description]}
          onChange={e =>
            updateField(AssetFieldNames.description, e.target.value)
          }
          multiline
          rows={10}
          className={classes.field}
        />
        <Markdown source={newFields[AssetFieldNames.description]} />
      </Paper>
      <Paper className={classes.row}>
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
      </Paper>
      <div className={classes.btns}>
        <Button onClick={onSaveBtnClick}>Save</Button>
      </div>
    </>
  )
}
