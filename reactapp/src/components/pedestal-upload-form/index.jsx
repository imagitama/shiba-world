import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'

import FileUploader from '../file-uploader'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import Button from '../button'
import PedestalVideo from '../pedestal-video'

import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import placeholderPedestalUrl from '../../assets/videos/placeholder-pedestal.webm'
import fallbackPlaceholderPedestalUrl from '../../assets/videos/placeholder-pedestal-fallback.webp'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  },
  heading: {
    margin: '0 0 1rem 0'
  },
  videos: {
    width: '300px',
    height: '300px',
    position: 'relative'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    '& img': {
      width: '100%',
      height: '100%',
      display: 'block'
    }
  },
  dummy: {
    opacity: 0.5
  }
})

function VideoUploadForm({ assetId, userId, onUploaded }) {
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const classes = useStyles()
  const [isDummyRobotVisible, setIsDummyRobotVisible] = useState(true)
  const [currentSeekTime, setCurrentSeekTime] = useState(0)

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
          <p>
            <strong>Upload successful</strong>
          </p>
          <p>
            Please ensure that it matches the rotation and speed of our amazing
            dummy robot:
          </p>
          <div className={classes.videos}>
            <div className={classes.video}>
              <PedestalVideo
                videoUrl={uploadedUrl}
                onTimeUpdate={setCurrentSeekTime}
              />
            </div>
            {isDummyRobotVisible && (
              <div className={`${classes.video} ${classes.dummy}`}>
                <PedestalVideo
                  preloadTime={currentSeekTime}
                  videoUrl={placeholderPedestalUrl}
                  noShadow
                />
              </div>
            )}
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDummyRobotVisible}
                onClick={() => setIsDummyRobotVisible(!isDummyRobotVisible)}
              />
            }
            label="Show dummy robot"
          />
          <br />
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
            <li>10 second duration</li>
            <li>
              360 degree rotation of your 3D model (do NOT spin more than once)
            </li>
            <li>transparent .webm</li>
            <li>under 2mb</li>
          </ul>
          <FileUploader
            directoryPath={`pedestals/${userId ? 'users/' : ''}${assetId ||
              userId}`}
            onDownloadUrl={onUploadedVideo}
            mimeTypes={['video/webm']}
          />
        </>
      )}
    </>
  )
}

function ImageUploadForm({ assetId, userId, videoUrl, onUploaded }) {
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const classes = useStyles()
  const [isDummyRobotVisible, setIsDummyRobotVisible] = useState(true)

  const onUploadedFallbackImage = url => {
    setUploadedUrl(url)
  }

  return (
    <>
      <Heading variant="h3" className={classes.heading}>
        Step 2: Fallback Image
      </Heading>
      {uploadedUrl ? (
        <>
          <p>
            <strong>Upload successful</strong>
          </p>
          <p>
            Please ensure the first frame perfectly overlaps your video below:
          </p>
          <div className={classes.videos}>
            <div className={classes.video}>
              <img
                src={uploadedUrl}
                alt="Uploaded fallback"
                className={classes.preview}
              />
            </div>
            {isDummyRobotVisible && (
              <div className={`${classes.video} ${classes.dummy}`}>
                <PedestalVideo videoUrl={videoUrl} initialState="paused" />
              </div>
            )}
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={isDummyRobotVisible}
                onClick={() => setIsDummyRobotVisible(!isDummyRobotVisible)}
              />
            }
            label="Show your paused video behind"
          />
          <br />
          <br />
          <Button onClick={() => onUploaded(uploadedUrl)}>Next Step</Button>
        </>
      ) : (
        <>
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
            directoryPath={`pedestals/${userId ? 'users/' : ''}${assetId ||
              userId}`}
            onDownloadUrl={onUploadedFallbackImage}
            mimeTypes={['image/webp']}
          />
        </>
      )}
    </>
  )
}

export default ({ assetId, onDone, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('')
  const [uploadedFallbackImageUrl, setUploadedFallbackImageUrl] = useState('')
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    assetId ? CollectionNames.Assets : CollectionNames.Users,
    assetId || userId
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save pedestal button', assetId)

      await save({
        [AssetFieldNames.pedestalVideoUrl]: uploadedVideoUrl,
        [AssetFieldNames.pedestalFallbackImageUrl]: uploadedFallbackImageUrl,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }
  if (isSaving) {
    return (
      <LoadingIndicator
        message={`Saving ${assetId ? 'asset' : 'your account'}...`}
      />
    )
  }

  if (isSaveError) {
    return (
      <ErrorMessage>Failed to save {assetId ? 'asset' : 'user'}</ErrorMessage>
    )
  }

  return (
    <div className={classes.root}>
      {uploadedVideoUrl && uploadedFallbackImageUrl ? (
        <>
          <Heading variant="h3" className={classes.heading}>
            Step 3: Save
          </Heading>
          <p>You can now save the pedestal by clicking below:</p>
          <Button onClick={onSaveBtnClick}>Save</Button>
        </>
      ) : uploadedVideoUrl ? (
        <ImageUploadForm
          assetId={assetId}
          onUploaded={url => setUploadedFallbackImageUrl(url)}
          videoUrl={uploadedVideoUrl}
        />
      ) : (
        <VideoUploadForm
          assetId={assetId}
          onUploaded={url => setUploadedVideoUrl(url)}
        />
      )}
    </div>
  )
}
