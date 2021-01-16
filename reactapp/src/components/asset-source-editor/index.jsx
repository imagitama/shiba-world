import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

import Button from '../button'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
    margin: '1rem 0'
  }
})

export default ({ assetId, sourceUrl = undefined, onDone, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [newSourceUrl, setNewSourceUrl] = useState(sourceUrl)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save asset source button', assetId)

      await save({
        [AssetFieldNames.sourceUrl]: newSourceUrl,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset source URL', err)
      handleError(err)
    }
  }

  return (
    <>
      <p>
        Enter the URL of the source of the asset. eg. the Gumroad URL, VRChat
        world URL, Tweet URL
      </p>

      <TextField
        className={classes.textInput}
        value={newSourceUrl}
        onChange={e => setNewSourceUrl(e.target.value)}
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
