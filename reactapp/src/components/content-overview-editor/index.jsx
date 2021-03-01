import React, { useState, Fragment } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import {
  isUrlAnImage,
  isUrlAVideo,
  createRef,
  isUrlAYoutubeVideo,
  isUrlATweet
} from '../../utils'
import { handleError } from '../../error-handling'
import { getImageUrlAsFile } from '../../utils/files'

import Heading from '../heading'
import AssetAttachmentUploader from '../asset-attachment-uploader'
import AssetTitleEditor from '../asset-title-editor'
import PageControls from '../page-controls'
import Button from '../button'
import AssetSourceEditor from '../asset-source-editor'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import ChangeSpeciesEditor from '../change-species-editor'
import ThumbnailUploader from '../thumbnail-uploader'
import AssetThumbnail from '../asset-thumbnail'
import LinkedAssetsEditor from '../linked-assets-editor'
import ChildrenAssets from '../asset-overview/components/children-assets'
import defaultTwitterThumbnailUrl from '../../assets/images/default-twitter-thumbnail.webp'

const ContentTypes = {
  IMAGE: 'IMAGE',
  OTHER: 'OTHER'
}

const contentTypeLabels = {
  IMAGE: 'Image/Video',
  OTHER: 'URL'
}

const useStyles = makeStyles({
  section: {
    padding: '1rem',
    background: 'rgba(0,0,0,0.1)',
    marginBottom: '0.5rem'
  },
  heading: {
    margin: '0 0 0.5rem 0'
  }
})

function Attachments({ assetId, selectedContentType, onDone }) {
  switch (ContentTypes[selectedContentType]) {
    case ContentTypes.IMAGE:
      return (
        <AssetAttachmentUploader
          assetId={assetId}
          onDone={onDone}
          onlyImage
          limit={1}
        />
      )
    default:
      return null
  }
}

function SelectContentType({ assetId, selectedContentType, onSelected }) {
  const userId = useFirebaseUserId()
  const [isSaving, , isErrorSaving, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (isSaving) {
    return 'Saving...'
  }

  if (isErrorSaving) {
    return 'Failed to change content type - try again later'
  }

  const onClickContentType = async newContentType => {
    onSelected(newContentType)

    if (newContentType !== ContentTypes.OTHER) {
      return
    }

    try {
      await save({
        [AssetFieldNames.fileUrls]: [],
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {Object.keys(ContentTypes).map(contentType => (
        <Fragment key={contentType}>
          <Button
            color={contentType === selectedContentType ? 'primary' : 'default'}
            onClick={() => onClickContentType(contentType)}>
            {contentTypeLabels[contentType]}
          </Button>{' '}
        </Fragment>
      ))}
    </>
  )
}

const getSelectedContentTypeFromFileUrls = fileUrls => {
  if (fileUrls.find(url => isUrlAnImage(url) || isUrlAVideo(url))) {
    return ContentTypes.IMAGE
  }
  return ContentTypes.OTHER
}

const Section = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.section}>{children}</div>
}

// source: https://stackoverflow.com/a/66405602/1215393
const getVideoIdFromYouTubeUrl = url =>
  url.match(
    /(?:https?:\/\/)?(?:www\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\/?\?v=|\/embed\/|\/)([^\s&]+)/
  )[1]

export default ({
  asset: {
    id,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.fileUrls]: fileUrls = [],
    [AssetFieldNames.sourceUrl]: sourceUrl,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.children]: linkedAssets = []
  },
  switchEditorOpen,
  analyticsCategoryName,
  onDone
}) => {
  const assetId = id
  const [selectedContentType, setSelectedContentType] = useState(
    getSelectedContentTypeFromFileUrls(fileUrls)
  )
  const [isThumbnailUploaderVisible, setIsThumbnailUploaderVisible] = useState(
    false
  )
  const [thumbnailPreloadedUrl, setThumbnailPreloadedUrl] = useState(null)
  const [thumbnailPreloadFile, setThumbnailPreloadFile] = useState(null)
  const classes = useStyles()

  const onClickGenerateThumbnail = async () => {
    let url

    if (
      selectedContentType === ContentTypes.OTHER &&
      isUrlAYoutubeVideo(sourceUrl)
    ) {
      const videoId = getVideoIdFromYouTubeUrl(sourceUrl)
      url = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    }

    if (fileUrls.length && isUrlAnImage(fileUrls[0])) {
      url = fileUrls[0]
    }

    if (isUrlATweet(sourceUrl)) {
      url = defaultTwitterThumbnailUrl
    }

    if (!url) {
      throw new Error('Cannot generate a thumbnail without a valid url!')
    }

    const file = await getImageUrlAsFile(url, 'my-thumbnail')
    setThumbnailPreloadFile(file)
    setThumbnailPreloadedUrl(url)
  }

  const getCanGenerateThumbnail = () => {
    if (
      selectedContentType === ContentTypes.OTHER &&
      isUrlAYoutubeVideo(sourceUrl)
    ) {
      return true
    }
    if (fileUrls.length && isUrlAnImage(fileUrls[0])) {
      return true
    }
    if (isUrlATweet(sourceUrl)) {
      return true
    }
    return false
  }

  return (
    <>
      <Heading variant="h1">Edit Content</Heading>
      <Section>
        <Heading variant="h2" className={classes.heading}>
          Change Type
        </Heading>
        <p>
          Warning: By changing the type you will need to re-upload any
          attachments.
        </p>
        <SelectContentType
          assetId={id}
          selectedContentType={selectedContentType}
          onSelected={setSelectedContentType}
        />
      </Section>
      <Section>
        <Heading variant="h2" className={classes.heading}>
          Species
        </Heading>
        <ChangeSpeciesEditor assetId={id} />
      </Section>
      <Section>
        <Heading variant="h2" className={classes.heading}>
          Thumbnail
        </Heading>
        <AssetThumbnail url={thumbnailUrl} />
        {getCanGenerateThumbnail() && (
          <Button onClick={onClickGenerateThumbnail}>Generate Thumbnail</Button>
        )}{' '}
        <Button
          onClick={() => {
            setIsThumbnailUploaderVisible(true)
            setThumbnailPreloadedUrl(null)
          }}
          color="default">
          Upload Manually
        </Button>
        {(isThumbnailUploaderVisible || thumbnailPreloadedUrl) && (
          <ThumbnailUploader
            assetId={id}
            onDone={() => {
              setIsThumbnailUploaderVisible(false)
              setThumbnailPreloadedUrl(null)
            }}
            preloadFile={thumbnailPreloadFile}
            preloadImageUrl={thumbnailPreloadedUrl}
          />
        )}
      </Section>
      <Section>
        <Heading variant="h2" className={classes.heading}>
          Title
        </Heading>
        <p>
          Enter a title below or leave blank (remember to click the tick to
          save).
        </p>
        <AssetTitleEditor assetId={id} title={title} showSimpleInput />
      </Section>
      <Section>
        <Heading variant="h2" className={classes.heading}>
          {selectedContentType === ContentTypes.IMAGE ? 'Source' : 'URL'}
        </Heading>
        <AssetSourceEditor
          assetId={id}
          sourceUrl={sourceUrl}
          hint={
            selectedContentType === ContentTypes.IMAGE
              ? 'Where did you find the image or video? Link to the tweet or blog post or whatever.'
              : 'The URL of the content. YouTube videos and tweets will be embedded.'
          }
        />
      </Section>
      {selectedContentType === ContentTypes.IMAGE && (
        <Section>
          <Heading variant="h2" className={classes.heading}>
            Attachments
          </Heading>
          <Attachments assetId={id} selectedContentType={selectedContentType} />
        </Section>
      )}
      <Section>
        <Heading variant="h2" className={classes.heading}>
          Related Assets
        </Heading>
        <p>
          Link existing assets to your content and (eventually) your content
          will be shown on the asset page!
        </p>
        <LinkedAssetsEditor
          assetId={assetId}
          actionCategory={analyticsCategoryName}
          linkedAssets={linkedAssets}
        />
      </Section>
      {onDone ||
        (switchEditorOpen && (
          <PageControls>
            <Button onClick={onDone || switchEditorOpen}>Done</Button>
          </PageControls>
        ))}
    </>
  )
}
