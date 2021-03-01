import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import YouTubePlayer from 'react-player/youtube'
import LazyLoad from 'react-lazyload'
import { Helmet } from 'react-helmet'

import {
  AssetFieldNames,
  AssetMetaFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import {
  canEditAsset,
  isUrlAnImage,
  isUrlAVideo,
  isUrlAYoutubeVideo,
  isUrlATweet,
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl
} from '../../utils'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import Markdown from '../markdown'
import Heading from '../heading'
import Button from '../button'
import ReportButton from '../report-button'
import EndorseAssetButton from '../endorse-asset-button'
import ReportMessage from '../asset-overview/components/report-message'
import VisitSourceButton from '../visit-source-button'
import VideoPlayer from '../video-player'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import ChildrenAssets from '../asset-overview/components/children-assets'
import Tweet from '../tweet'

const useStyles = makeStyles({
  contentWrapper: {
    maxWidth: '100%',
    margin: '2rem 0',
    display: 'flex',
    justifyContent: 'center',
    '& img': {
      maxWidth: '100%'
    }
  },
  controls: {
    justifyContent: 'center',
    display: 'flex'
  },
  control: {
    padding: '0.25rem'
  },
  meta: {
    textAlign: 'center'
  }
})

const getImageUrlFromUrls = fileUrls => fileUrls.find(url => isUrlAnImage(url))

const getVideoUrlFromUrls = fileUrls => fileUrls.find(url => isUrlAVideo(url))

const Control = ({ children }) => {
  const classes = useStyles()
  return <div className={classes.control}>{children}</div>
}

const ContentOutput = ({
  assetId,
  fileUrls,
  sourceUrl,
  analyticsCategoryName
}) => {
  const attachedImageUrl = getImageUrlFromUrls(fileUrls)

  if (attachedImageUrl) {
    return <img src={attachedImageUrl} alt="Content" />
  }

  const attachedVideoUrl = getVideoUrlFromUrls(fileUrls)

  if (attachedVideoUrl) {
    return <VideoPlayer url={attachedVideoUrl} />
  }

  if (isUrlAYoutubeVideo(sourceUrl)) {
    return (
      <YouTubePlayer
        url={sourceUrl}
        onPlay={() =>
          trackAction(
            analyticsCategoryName,
            'Click play youtube video for asset',
            assetId
          )
        }
      />
    )
  }

  if (isUrlATweet(sourceUrl)) {
    return <Tweet url={sourceUrl} />
  }

  return 'No image/video or URL provided'
}

export default ({
  asset: {
    id,
    [AssetFieldNames.fileUrls]: fileUrls,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.sourceUrl]: sourceUrl,
    [AssetFieldNames.createdBy]: createdBy,
    [AssetFieldNames.ownedBy]: ownedBy,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.author]: authorRef
  },
  assetMeta: {
    [AssetMetaFieldNames.authorName]: authorName,
    // [AssetMetaFieldNames.speciesNames]: speciesNames,
    [AssetMetaFieldNames.linkedAssets]: linkedAssets,
    [AssetMetaFieldNames.endorsementCount]: endorsementCount
  },
  analyticsCategoryName,
  switchEditorOpen
}) => {
  const assetId = id
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isReportMessageOpen, setIsReportMessageOpen] = useState(false)

  const isOwnerOrEditor = canEditAsset(user, createdBy, ownedBy)

  return (
    <div>
      <Helmet>
        <title>
          {title || 'View uploaded content'} |{' '}
          {authorRef ? `By ${authorName || '???'} | ` : ''}VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewAssetWithVar.replace(':assetId', id)
          )}
        />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:site_name" content="VRCArena" />
      </Helmet>
      {isReportMessageOpen && <ReportMessage assetId={id} />}
      <div className={classes.meta}>
        {title && <Heading variant="h1">{title}</Heading>}
        {authorName && <Heading variant="h2">By {authorName}</Heading>}
      </div>
      <div className={classes.contentWrapper}>
        <ContentOutput
          assetId={id}
          fileUrls={fileUrls}
          sourceUrl={sourceUrl}
          analyticsCategoryName={analyticsCategoryName}
        />
      </div>
      {description && <Markdown source={description} />}
      <div className={classes.controls}>
        {sourceUrl && (
          <Control>
            <VisitSourceButton
              assetId={id}
              sourceUrl={sourceUrl}
              isNoFilesAttached
            />
          </Control>
        )}
        {isOwnerOrEditor && (
          <Control>
            <Button
              onClick={() => {
                trackAction(analyticsCategoryName, 'Click switch editor button')
                switchEditorOpen()
              }}
              color="default"
              icon={<EditIcon />}>
              Edit Asset
            </Button>
          </Control>
        )}
        <Control>
          <ReportButton
            assetId={id}
            analyticsCategoryName={analyticsCategoryName}
            onClick={() => setIsReportMessageOpen(true)}
          />
        </Control>
        <Control>
          <EndorseAssetButton
            assetId={id}
            endorsementCount={endorsementCount}
            onClick={({ newValue }) =>
              trackAction(
                analyticsCategoryName,
                newValue === true
                  ? 'Click endorse button'
                  : 'Click disendorse button',
                id
              )
            }
          />
        </Control>
      </div>
      {linkedAssets.length ? (
        <>
          <Heading variant="h2">Related Assets</Heading>
          <ChildrenAssets assetChildren={linkedAssets} />
        </>
      ) : null}
      <Heading variant="h2">Comments</Heading>
      <LazyLoad>
        <CommentList
          collectionName={CollectionNames.Assets}
          parentId={assetId}
        />
        <AddCommentForm
          collectionName={CollectionNames.Assets}
          parentId={assetId}
          onAddClick={() =>
            trackAction(analyticsCategoryName, 'Click add comment button', {
              assetId
            })
          }
        />
      </LazyLoad>
    </div>
  )
}
