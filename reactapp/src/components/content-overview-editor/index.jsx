import React, { useState, useEffect } from 'react'
import shortid from 'shortid'
import { makeStyles } from '@material-ui/core/styles'
import SaveIcon from '@material-ui/icons/Save'

import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'
import {
  ContentTypes,
  paths,
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT
} from '../../config'
import { getImageUrlAsFile } from '../../utils/files'
import { trackAction } from '../../analytics'
import {
  scrollToTop,
  isUrlAYoutubeVideo,
  isUrlATweet,
  createRef
} from '../../utils'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import AssetThumbnail from '../asset-thumbnail'
import TextInput from '../text-input'
import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import OptimizedImageUploader from '../optimized-image-uploader'
import Heading from '../heading'
import FormControls from '../form-controls'
import AssetAttachmentUploader from '../asset-attachment-uploader'
import AssetContentOutput from '../asset-content-output'

import ContentTypeSelector from './components/content-type-selector'

// source: https://stackoverflow.com/a/66405602/1215393
const getVideoIdFromYouTubeUrl = url =>
  url.match(
    /(?:https?:\/\/)?(?:www\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\/?\?v=|\/embed\/|\/)([^\s&]+)/
  )[1]

const useStyles = makeStyles({
  input: { width: '100%' }
})

function YouTubeVideoForm({ onFieldsPopulated, onCancel }) {
  const [youTubeVideoUrl, setYouTubeVideoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const classes = useStyles()

  const onClickDone = async () => {
    try {
      if (!youTubeVideoUrl) {
        return
      }

      setIsLoading(true)
      setIsError(false)

      const videoId = getVideoIdFromYouTubeUrl(youTubeVideoUrl)

      // https://developers.google.com/youtube/v3/docs/videos#snippet
      const { data: result } = await callFunction('getYouTubeVideoMeta', {
        videoId
      })

      onFieldsPopulated(
        {
          [AssetFieldNames.title]: result.title,
          [AssetFieldNames.description]: result.description,
          [AssetFieldNames.sourceUrl]: youTubeVideoUrl
        },
        result.downloadedThumbnailUrl
      )

      // setIsLoading(false)
      // setIsError(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
      setIsError(true)
    }
  }

  if (isLoading) {
    return <LoadingIndicator message="Fetching video details..." />
  }

  if (isError) {
    return (
      <ErrorMessage>
        Failed to fetch the video details.
        <br />
        <br />
        <Button onClick={onClickDone} color="default">
          Try Again
        </Button>{' '}
        <Button
          onClick={() =>
            onFieldsPopulated({
              [AssetFieldNames.sourceUrl]: youTubeVideoUrl
            })
          }>
          Skip
        </Button>
      </ErrorMessage>
    )
  }

  return (
    <>
      <Heading variant="h2">YouTube Video</Heading>
      <p>Enter the YouTube video URL below:</p>
      <TextInput
        className={classes.input}
        value={youTubeVideoUrl}
        onChange={e => setYouTubeVideoUrl(e.target.value)}
      />
      <FormControls>
        <Button onClick={onClickDone}>Continue</Button>{' '}
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

const getTweetIdFromUrl = url => url.split('/').pop()

function TweetForm({ onFieldsPopulated, onCancel }) {
  const [tweetUrl, setTweetUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const classes = useStyles()

  const onClickDone = async () => {
    try {
      if (!tweetUrl) {
        return
      }

      setIsLoading(true)
      setIsError(false)

      const tweetId = getTweetIdFromUrl(tweetUrl)

      // https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-show-id
      const { data: result } = await callFunction('getTweetMeta', {
        tweetId
      })

      onFieldsPopulated(
        {
          [AssetFieldNames.title]: `Tweet by @${result.user.screen_name}`,
          [AssetFieldNames.description]: result.text,
          [AssetFieldNames.sourceUrl]: tweetUrl
        },
        result.imageUrl
      )

      // setIsLoading(false)
      // setIsError(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
      setIsError(true)
    }
  }

  if (isLoading) {
    return <LoadingIndicator message="Fetching tweet details..." />
  }

  if (isError) {
    return (
      <ErrorMessage>
        Failed to fetch the tweet details.
        <br />
        <br />
        <Button onClick={onClickDone} color="default">
          Try Again
        </Button>{' '}
        <Button
          onClick={() =>
            onFieldsPopulated({
              [AssetFieldNames.sourceUrl]: tweetUrl
            })
          }>
          Skip
        </Button>
      </ErrorMessage>
    )
  }

  return (
    <>
      <Heading variant="h2">Tweet</Heading>
      <p>Enter the tweet URL below:</p>
      <TextInput
        className={classes.input}
        value={tweetUrl}
        onChange={e => setTweetUrl(e.target.value)}
      />
      <FormControls>
        <Button onClick={onClickDone}>Continue</Button>{' '}
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

function ImageForm({ assetId, onDone, onCancel }) {
  return (
    <>
      <Heading variant="h2">Image</Heading>
      <p>Upload an image below:</p>
      <AssetAttachmentUploader
        assetId={assetId}
        onDone={onDone}
        onlyImage
        limit={1}
      />
      <FormControls>
        <Button onClick={() => onCancel()} color="default">
          Cancel
        </Button>
      </FormControls>
    </>
  )
}

function StandardForm({
  assetId,
  fields,
  preloadFile,
  preloadImageUrl,
  onDone,
  onRestart
}) {
  const userId = useFirebaseUserId()
  const [assetFields, setAssetFields] = useState(fields)
  const [isSaving, , isError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [isInvalid, setIsInvalid] = useState(false)

  const onDoneClick = async () => {
    try {
      trackAction('EditAsset', 'Click save button')

      if (!assetFields[AssetFieldNames.thumbnailUrl]) {
        setIsInvalid(true)
        return
      }

      scrollToTop()

      await save({
        ...assetFields,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset', assetFields, err)
      handleError(err)
    }
  }

  const onFieldChange = (name, val) =>
    setAssetFields({ ...assetFields, [name]: val })

  if (isSaving) {
    return <LoadingIndicator message="Saving asset..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to save asset</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h2">Edit Content</Heading>

      {isInvalid && <ErrorMessage>Please provide a thumbnail</ErrorMessage>}

      <AssetContentOutput
        assetId={assetId}
        fileUrls={fields[AssetFieldNames.fileUrls] || []}
        sourceUrl={fields[AssetFieldNames.sourceUrl]}
      />
      <br />
      <br />

      <Button onClick={onRestart}>
        Click here to enter a URL or upload an image again
      </Button>
      <br />
      <p>
        <strong>Title</strong>
      </p>
      <TextInput
        value={assetFields[AssetFieldNames.title]}
        onChange={e => onFieldChange(AssetFieldNames.title, e.target.value)}
        className={classes.input}
      />
      <p>
        <strong>Description</strong> (Markdown supported)
      </p>
      <TextInput
        multiline
        rows={5}
        value={assetFields[AssetFieldNames.description]}
        onChange={e =>
          onFieldChange(AssetFieldNames.description, e.target.value)
        }
        className={classes.input}
      />
      <p>
        <strong>Thumbnail</strong>
      </p>
      {assetFields[AssetFieldNames.thumbnailUrl] && (
        <AssetThumbnail url={assetFields[AssetFieldNames.thumbnailUrl]} />
      )}
      <OptimizedImageUploader
        directoryPath={paths.assetThumbnailDir}
        filePrefix={shortid.generate()}
        onUploadedUrl={url => onFieldChange(AssetFieldNames.thumbnailUrl, url)}
        requiredWidth={THUMBNAIL_WIDTH}
        requiredHeight={THUMBNAIL_HEIGHT}
        preloadFile={preloadFile}
        preloadImageUrl={preloadImageUrl}
      />
      <p>
        <strong>Source URL</strong>
      </p>
      <TextInput
        value={assetFields[AssetFieldNames.sourceUrl]}
        onChange={e => onFieldChange(AssetFieldNames.sourceUrl, e.target.value)}
        className={classes.input}
      />
      <FormControls>
        <Button onClick={() => onDoneClick()} icon={<SaveIcon />}>
          Save
        </Button>
      </FormControls>
    </>
  )
}

const getSelectedContentTypeFromAsset = (fileUrls, sourceUrl) => {
  if (fileUrls.length === 1) {
    return ContentTypes.IMAGE
  }

  if (isUrlAYoutubeVideo(sourceUrl)) {
    return ContentTypes.YOUTUBE_VIDEO
  }

  if (isUrlATweet(sourceUrl)) {
    return ContentTypes.TWEET
  }

  return null
}

export default ({
  asset: {
    id,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.fileUrls]: fileUrls = [],
    [AssetFieldNames.sourceUrl]: sourceUrl,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.children]: linkedAssets = []
  },
  switchEditorOpen
}) => {
  const assetId = id
  const [selectedContentType, setSelectedContentType] = useState(null)
  const [newFields, setNewFields] = useState({
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.fileUrls]: fileUrls,
    [AssetFieldNames.sourceUrl]: sourceUrl,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.children]: linkedAssets
  })
  const [preloadFile, setPreloadFile] = useState(null)
  const [preloadImageUrl, setPreloadImageUrl] = useState(null)
  const [showStandardForm, setShowStandardForm] = useState(null)

  useEffect(() => {
    // when we save attached files we need it to propogate down to our components
    setNewFields({
      ...newFields,
      [AssetFieldNames.fileUrls]: fileUrls
    })
  }, [fileUrls.join(',')])

  if (
    showStandardForm === true ||
    (getSelectedContentTypeFromAsset(
      newFields[AssetFieldNames.fileUrls] || [],
      newFields[AssetFieldNames.sourceUrl]
    ) &&
      selectedContentType !== ContentTypes.NONE)
  ) {
    return (
      <StandardForm
        assetId={assetId}
        fields={newFields}
        preloadFile={preloadFile}
        preloadImageUrl={preloadImageUrl}
        onDone={() => switchEditorOpen()}
        onRestart={() => {
          setNewFields({})
          setSelectedContentType(null)
          setShowStandardForm(null)
        }}
      />
    )
  }

  if (!selectedContentType) {
    return (
      <>
        <Heading variant="h2">Upload Content</Heading>
        <ContentTypeSelector onSelect={setSelectedContentType} />
      </>
    )
  }

  if (selectedContentType === ContentTypes.YOUTUBE_VIDEO) {
    return (
      <YouTubeVideoForm
        onFieldsPopulated={async (fields, imageUrl) => {
          if (imageUrl) {
            const file = await getImageUrlAsFile(imageUrl)
            setPreloadFile(file)
          }

          setPreloadImageUrl(imageUrl)
          setNewFields(fields)
        }}
        onCancel={() => setSelectedContentType(null)}
      />
    )
  }

  if (selectedContentType === ContentTypes.TWEET) {
    return (
      <TweetForm
        onFieldsPopulated={async (fields, imageUrl) => {
          if (imageUrl) {
            const file = await getImageUrlAsFile(imageUrl)
            setPreloadFile(file)
          }

          setPreloadImageUrl(imageUrl)
          setNewFields(fields)
        }}
        onCancel={() => setSelectedContentType(null)}
      />
    )
  }

  if (selectedContentType === ContentTypes.IMAGE) {
    return (
      <ImageForm
        assetId={assetId}
        onDone={() => setShowStandardForm(true)}
        onCancel={() => setSelectedContentType(null)}
      />
    )
  }

  return 'Error'
}
