import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'

import FileUploader from '../file-uploader'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import Button from '../button'

import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    margin: '1rem 0'
  },
  heading: {
    margin: '0 0 1rem 0'
  },
  preview: {
    width: 500,
    height: 500
  }
})

function VideoUploadForm({ assetId, onUploaded }) {
  const [uploadedUrl, setUploadedUrl] = useState(false)
  const classes = useStyles()

  const onUploadedVideo = url => {
    setUploadedUrl(url)
  }

  return (
    <>
      <Heading variant="h3" className={classes.heading}>
        Step 1: Video
      </Heading>
      {uploadedUrl ? (
        <>
          <p>Upload successful!</p>
          <video className={classes.preview} autoPlay muted loop>
            <source src={uploadedUrl} />
          </video>
          <br />
          <Button onClick={() => onUploaded(uploadedUrl)}>Next Step</Button>
        </>
      ) : (
        <>
          <p>
            You can upload a <strong>very specific</strong> video here. How to
            do so are in the #patrons channel of our Discord server (click the
            icon at the top left of the page).
          </p>
          <ul>
            <li>1000x1000</li>
            <li>transparent .webm</li>
            <li>under 2mb</li>
          </ul>
          <FileUploader
            directoryPath={`pedestals/${assetId}`}
            onDownloadUrl={onUploadedVideo}
          />
        </>
      )}
    </>
  )
}

function ImageUploadForm({ assetId, onUploaded }) {
  const [uploadedUrl, setUploadedUrl] = useState(false)
  const classes = useStyles()

  const onUploadedFallbackImage = url => {
    setUploadedUrl(url)
  }

  return (
    <>
      {uploadedUrl ? (
        <>
          <p>Upload successful!</p>
          <img
            src={uploadedUrl}
            alt="Uploaded fallback"
            width="500"
            height="500"
            className={classes.preview}
          />
          <Button onClick={() => onUploaded(uploadedUrl)}>Next Step</Button>
        </>
      ) : (
        <>
          <Heading variant="h3" className={classes.heading}>
            Step 2: Fallback Image
          </Heading>
          <p>
            Some browsers cannot view webm videos or the user might be on a slow
            connection so we will display a fallback image instead. Instructions
            for how to generate this image from your video are in the #patrons
            channel.
          </p>
          <ul>
            <li>transparent .webp</li>
            <li>1000x1000 dimensions</li>
            <li>under 200kb</li>
          </ul>
          <FileUploader
            directoryPath={`pedestals/${assetId}`}
            onDownloadUrl={onUploadedFallbackImage}
          />
        </>
      )}
    </>
  )
}

export default ({ assetId, onDone }) => {
  const userId = useFirebaseUserId()
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('')
  const [uploadedFallbackImageUrl, setUploadedFallbackImageUrl] = useState('')
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      trackAction('ViewAsset', 'Click save pedestal button', assetId)

      await save({
        [AssetFieldNames.pedestalVideoUrl]: uploadedVideoUrl,
        [AssetFieldNames.pedestalFallbackImageUrl]: uploadedFallbackImageUrl,
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
  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  return (
    <Paper className={classes.root}>
      {uploadedVideoUrl && uploadedFallbackImageUrl ? (
        <>
          <Heading variant="h3" className={classes.heading}>
            Step 3: Save
          </Heading>
          <p>You can now save the pedestal for the asset by clicking below:</p>
          <Button onClick={onSaveBtnClick}>Save</Button>
        </>
      ) : uploadedVideoUrl ? (
        <ImageUploadForm
          assetId={assetId}
          onUploaded={url => setUploadedFallbackImageUrl(url)}
        />
      ) : (
        <VideoUploadForm
          assetId={assetId}
          onUploaded={url => setUploadedVideoUrl(url)}
        />
      )}
    </Paper>
  )
}
