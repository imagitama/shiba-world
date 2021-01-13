import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import Button from '../button'
import Paper from '../paper'
import TagChip from '../tag-chip'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  textInput: {
    width: '100%'
  }
})

const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

export default ({
  assetId,
  actionCategory = '',
  onDone = null,
  onCancel = null
}) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.AssetAmendments
  )
  const [newTags, setNewTags] = useState([])
  const classes = useStyles()

  useEffect(() => {
    if (!result) {
      return
    }

    if (result[AssetFieldNames.tags]) {
      setNewTags(result[AssetFieldNames.tags])
    }
  }, [result === null])

  if (!userId) {
    return 'You are not logged in'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (isError || !result) {
    return 'Error loading resource'
  }

  if (isSaving) {
    return 'Creating amendment...'
  }

  if (isSuccess) {
    return 'Tag amendment has been submitted'
  }

  if (isFailed) {
    return 'Error creating amendment'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save tags editor button', assetId)

      await save({
        [AssetAmendmentFieldNames.isRejected]: null,
        [AssetAmendmentFieldNames.asset]: createRef(
          CollectionNames.Assets,
          assetId
        ),
        [AssetAmendmentFieldNames.fields]: {
          [AssetFieldNames.tags]: newTags
        },
        [AssetAmendmentFieldNames.createdAt]: new Date(),
        [AssetAmendmentFieldNames.createdBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <Paper>
      <p>
        Any logged in user can propose changes to the tags of an asset.{' '}
        <strong>Enter 1 tag per line below.</strong>
      </p>
      <p>View your amendments by going to My Account -> Amendments.</p>
      <p>
        View amendments made by other users by going to My Account -> Amendments
        or scroll to the bottom of an asset.
      </p>
      <TextField
        variant="outlined"
        className={classes.textInput}
        value={convertTagsIntoText(newTags)}
        onChange={e => setNewTags(convertTextIntoTags(e.target.value))}
        rows={10}
        multiline
      />
      <br />
      <br />
      {newTags.map(newTag => (
        <TagChip key={newTag} tagName={newTag} />
      ))}
      <br />
      <br />
      <Button onClick={onSaveBtnClick}>Save</Button>{' '}
      <Button onClick={onCancel} color="default">
        Cancel
      </Button>
    </Paper>
  )
}
