import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

import TagChip from '../tag-chip'
import Button from '../button'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
    margin: '1rem 0'
  }
})

// todo: move to common place
const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

export default ({ assetId, tags = [], onDone, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [newTagsValue, setNewTagsValue] = useState(tags)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save asset tags', assetId)

      await save({
        [AssetFieldNames.tags]: newTagsValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset tags', err)
      handleError(err)
    }
  }

  return (
    <>
      {newTagsValue
        ? newTagsValue.map(tagName => (
            <TagChip key={tagName} tagName={tagName} />
          ))
        : '(no tags)'}

      <TextField
        variant="outlined"
        className={classes.textInput}
        value={convertTagsIntoText(newTagsValue)}
        onChange={e => setNewTagsValue(convertTextIntoTags(e.target.value))}
        rows={10}
        multiline
      />

      {isSaving ? (
        'Saving...'
      ) : isSaveSuccess ? (
        'Success!'
      ) : isSaveError ? (
        'Error'
      ) : (
        <Button onClick={onSaveBtnClick}>Save</Button>
      )}
    </>
  )
}
