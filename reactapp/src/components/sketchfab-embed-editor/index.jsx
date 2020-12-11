import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'

import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import TextInput from '../text-input'
import SketchfabEmbed from '../sketchfab-embed'

import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0'
  }
})

export default ({ assetId, onDone }) => {
  const userId = useFirebaseUserId()
  const [textFieldVal, setTextFieldVal] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      trackAction('ViewAsset', 'Click save sketchfab embed button', assetId)

      await save({
        [AssetFieldNames.sketchfabEmbedUrl]: embedUrl,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
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

  const onApplyBtnClick = () => setEmbedUrl(textFieldVal)

  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  return (
    <Paper className={classes.root}>
      <ol>
        <li>
          view your Sketchfab model and above the Triangles and Vertices count
          click the Embed button
        </li>
        <li>check any options you want for your embed</li>
        <li>select "iframe" as the format and copy the HTML code</li>
        <li>
          in Notepad find the URL of the iframe (the "src" attribute) and copy
          it into the text field below
        </li>
        <li>click Apply to preview then click Save</li>
      </ol>
      <TextInput
        onChange={e => setTextFieldVal(e.target.value)}
        style={{ width: '100%' }}
      />{' '}
      <Button onClick={onApplyBtnClick} color="default">
        Apply
      </Button>
      {embedUrl && <SketchfabEmbed url={embedUrl} />}
      <br />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </Paper>
  )
}