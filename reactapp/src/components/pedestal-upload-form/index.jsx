import React, { useState } from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'

import FileUploader from '../file-uploader'
import Paper from '../paper'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import VideoPlayer from '../video-player'
import Button from '../button'

import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

function VideoUploadForm({ onUploaded }) {
  const [uploadedUrl, setUploadedUrl] = useState(false)

  const onUploadedVideo = url => {
    setUploadedUrl(url)
    onUploaded(url)
  }

  return (
    <Paper>
      <Heading variant="h3">Video</Heading>
      {uploadedUrl ? (
        <>
          <p>Upload successful!</p>
          <VideoPlayer url={uploadedUrl} />
        </>
      ) : (
        <>
          <p>
            You can upload a <strong>very specific</strong> video here. This
            video must meet these requirements:
          </p>
          <ul>
            <li>transparent .webm</li>
            <li>1000x1000 dimensions</li>
            <li>10 seconds duration</li>
            <li>under 2mb</li>
          </ul>
          <p>Steps to generate this video:</p>
          <ul>
            <li>open [this Unity project] and import your model</li>
            <li>place it under the "rotator" object in the Hierarchy</li>
            <li>
              open Unity Recorder and ensure it matches [these settings] and
              record
            </li>
            <li>convert to webm by following [these steps]</li>
            <li>generate a fallback image by following [these steps]</li>
          </ul>
          <FileUploader onDownloadUrl={onUploadedVideo} />
        </>
      )}
    </Paper>
  )
}

function ImageUploadForm({ onUploaded }) {
  const [uploadedUrl, setUploadedUrl] = useState(false)

  const onUploadedFallbackImage = url => {
    setUploadedUrl(url)
    onUploaded(url)
  }

  return (
    <Paper>
      {uploadedUrl ? (
        <>
          <p>Upload successful!</p>
          <src
            url={uploadedUrl}
            alt="Uploaded fallback"
            width="500"
            height="500"
          />
        </>
      ) : (
        <>
          <Heading variant="h3">Fallback Image</Heading>
          <p>
            Some browsers cannot view webm videos or the user might be on a slow
            connection so we will display a fallback image instead. As with the
            video, this image is <strong>very specific</strong> and has these
            strict requirements:
          </p>
          <ul>
            <li>transparent .webp</li>
            <li>1000x1000 dimensions</li>
            <li>under 200kb</li>
          </ul>
          <FileUploader onDownloadUrl={onUploadedFallbackImage} />
        </>
      )}
    </Paper>
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
    <div>
      <VideoUploadForm onUploaded={url => setUploadedVideoUrl(url)} />
      <ImageUploadForm onUploaded={url => setUploadedFallbackImageUrl(url)} />
      {uploadedVideoUrl && uploadedFallbackImageUrl && (
        <>
          <Paper>
            <Heading variant="h3">Submit</Heading>
            <p>
              You can now save the pedestal for the asset by clicking below:
            </p>
            <Button onClick={onSaveBtnClick}>Save</Button>
          </Paper>
        </>
      )}
    </div>
  )
}
