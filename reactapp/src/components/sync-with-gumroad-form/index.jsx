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
import TagInput from '../tag-input'

import { handleError } from '../../error-handling'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import OptimizedImageUploader from '../optimized-image-uploader'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, paths } from '../../config'
import {
  addQuotesToDescription,
  removeQuotesFromDescription
} from '../../utils/formatting'
import { cleanupTags } from '../../utils/tags'

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

const tagsSearch = {
  // compatibility
  quest: ['quest'],
  sdk2: ['sdk2'],
  sdk3: ['SDK3'],
  // included
  blendfile_included: ['Blender file', 'Blendfile', 'Blend file'],
  unity_package: ['unitypackage', 'unity setup package'],
  substance_painter_included: ['substance'],
  nsfw_included: ['penis', 'vagina', 'genitals'],
  prefabs_included: ['prefab'],
  scene_included: ['unity scene'],
  psd_included: ['photoshop', 'psd'],
  uv_included: ['uv layout'],
  // features
  sdk3_puppets: ['puppet'],
  dynamic_bones: ['dynamic bones'],
  customizable_body: ['body shape', 'body slider'],
  hand_colliders: ['colliders'],
  full_body_ready: ['full body'],
  blend_shapes: ['blend shapes', 'shapekey', 'body slider', 'viseme'],
  toggle_accessories: ['Toggleable'],
  // appearance
  collar: ['collar'],
  glasses: ['glasses'],
  clothes: ['clothes', 'shirt', 'jeans', 'pants'],
  hair: ['hair'],
  // animation
  custom_gestures: ['facial expression', 'hand gesture', 'face expression'],
  custom_idle_animation: ['idle animation'],
  custom_emotes: ['emote']
}

const getTagsFromDescription = desc => {
  const tags = []
  const descLower = desc.toLowerCase()

  for (const tagName in tagsSearch) {
    for (const searchTerm of tagsSearch[tagName]) {
      if (
        descLower.includes(searchTerm.toLowerCase()) &&
        !tags.includes(tagName)
      ) {
        tags.push(tagName)
      }
    }
  }

  return tags
}

const cleanupFields = fields => {
  const newFields = { ...fields }
  if (newFields[AssetFieldNames.tags]) {
    newFields[AssetFieldNames.tags] = cleanupTags(
      newFields[AssetFieldNames.tags]
    )
  }
  return newFields
}

const defaultTags = ['gumroad', 'paid']

export default ({ assetId, gumroadUrl, onDone }) => {
  const [isFetching, setIsFetching] = useState(true)
  const [isFetchError, setIsFetchError] = useState(false)
  const [newFields, setNewFields] = useState({})
  const [whichFieldsAreEnabled, setWhichFieldsAreEnabled] = useState({
    [AssetFieldNames.title]: true,
    [AssetFieldNames.description]: true,
    [AssetFieldNames.tags]: true,
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
      } = await callFunction(
        'fetchGumroadInfo',
        {
          code
        },
        {
          data: {
            name: 'My in dev Gumroad asset',
            descriptionMarkdown: `# My asset

- Photoshop file included
- Dynamic Bones included
- shapekeys included`,
            ourPreviewUrl: null
          }
        }
      )

      setIsFetching(false)
      setIsFetchError(false)
      setNewFields({
        [AssetFieldNames.title]: name,
        [AssetFieldNames.description]: isUsingQuotes
          ? addQuotesToDescription(descriptionMarkdown)
          : descriptionMarkdown,
        [AssetFieldNames.tags]: getTagsFromDescription(
          descriptionMarkdown
        ).concat(defaultTags)
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
        ...getFieldsToSave(cleanupFields(newFields), whichFieldsAreEnabled),
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
        {isValidPreviewImageUrl(previewImageUrl) ? (
          <>
            Thumbnail
            <Checkbox
              checked={whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl]}
              onClick={() => toggleIsFieldEnabled(AssetFieldNames.thumbnailUrl)}
            />
            {whichFieldsAreEnabled[AssetFieldNames.thumbnailUrl] && (
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
            )}
          </>
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
        {whichFieldsAreEnabled[AssetFieldNames.title] && (
          <>
            <br />
            <TextField
              value={newFields[AssetFieldNames.title]}
              onChange={e => updateField(AssetFieldNames.title, e.target.value)}
              className={classes.field}
            />
          </>
        )}
      </Paper>
      <Paper className={classes.row}>
        Description
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.description]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.description)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.description] && (
          <>
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
          </>
        )}
      </Paper>
      {whichFieldsAreEnabled[AssetFieldNames.description] && (
        <Paper className={classes.row}>
          <Checkbox
            checked={isUsingQuotes}
            onClick={() => {
              updateField(
                AssetFieldNames.description,
                isUsingQuotes
                  ? removeQuotesFromDescription(
                      newFields[AssetFieldNames.description]
                    )
                  : addQuotesToDescription(
                      newFields[AssetFieldNames.description]
                    )
              )
              setIsUsingQuotes(!isUsingQuotes)
            }}
          />{' '}
          Add quote symbols to description (recommended)
        </Paper>
      )}
      <Paper className={classes.row}>
        Tags
        <Checkbox
          checked={whichFieldsAreEnabled[AssetFieldNames.tags]}
          onClick={() => toggleIsFieldEnabled(AssetFieldNames.tags)}
        />
        {whichFieldsAreEnabled[AssetFieldNames.tags] && (
          <>
            <br />
            Tags have been populated using the description from Gumroad:
            <TagInput
              currentTags={newFields[AssetFieldNames.tags]}
              onChange={newTags => updateField(AssetFieldNames.tags, newTags)}
              showInfo={false}
            />
          </>
        )}
      </Paper>
      <div className={classes.btns}>
        <Button onClick={onSaveBtnClick}>Save</Button>
      </div>
    </>
  )
}
