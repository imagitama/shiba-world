import React from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Helmet } from 'react-helmet'
import LaunchIcon from '@material-ui/icons/Launch'
import GetAppIcon from '@material-ui/icons/GetApp'
import EditIcon from '@material-ui/icons/Edit'

import useDatabaseQuery from '../../hooks/useDatabaseQuery'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import FormattedDate from '../formatted-date'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import EndorseAssetButton from '../endorse-asset-button'
import TagChip from '../tag-chip'
import Heading from '../heading'
import Button from '../button'
import AssetThumbnail from '../asset-thumbnail'
import VideoPlayer from '../video-player'
import EndorsementList from '../endorsement-list'
import ApproveBtn from '../approve-asset-button'
import DeleteBtn from '../delete-asset-button'
import ImageGallery from '../image-gallery'

import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import { trackAction, actions } from '../../analytics'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canApproveAsset,
  canEditAsset,
  isUrlAnImage,
  isUrlAVideo,
  isUrlNotAnImageOrVideo
} from '../../utils'

import NotApprovedMessage from './components/not-approved-message'
import DeletedMessage from './components/deleted-message'
import FileList from './components/file-list'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  thumbnailAndControls: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  thumbnailWrapper: {
    textAlign: 'center',
    '@media (max-width: 959px)': {
      flex: 1,
      marginBottom: '0.5rem'
    }
  },
  subtitle: {
    marginTop: '0.5rem'
  },
  description: {
    margin: '2rem 0 1rem',
    '& A': { textDecoration: 'underline' }
  },
  downloadButton: {
    '& a': {
      color: 'inherit'
    }
  },
  controls: {
    flex: 1,
    textAlign: 'right',
    '@media (max-width: 959px)': {
      textAlign: 'center'
    }
  },
  controlBtn: {
    marginLeft: '0.5rem'
  }
})

function getSpeciesDisplayNameBySpeciesName(speciesName) {
  if (!speciesName) {
    return 'All Species'
  }
  if (!speciesMeta[speciesName]) {
    throw new Error(`Unknown species name ${speciesName}`)
  }
  return speciesMeta[speciesName].name
}

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
}

function VisitSourceButton({ sourceUrl, isNoFilesAttached = false }) {
  const classes = useStyles()
  return (
    <Button
      color={isNoFilesAttached ? 'primary' : 'default'}
      className={classes.controlBtn}
      url={sourceUrl}
      icon={<LaunchIcon />}>
      Visit Source
    </Button>
  )
}

function DownloadButton({ assetId, url }) {
  const classes = useStyles()

  const onDownloadBtnClick = () =>
    trackAction(actions.DOWNLOAD_ASSET, {
      assetId,
      url
    })

  return (
    <Button
      className={classes.controlBtn}
      url={url}
      icon={<GetAppIcon />}
      onClick={onDownloadBtnClick}>
      Download
    </Button>
  )
}

export default ({ assetId, small = false }) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [, , user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (
    isErrored ||
    result === null ||
    (!user && result && result.isApproved === false)
  ) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const {
    id,
    title,
    description,
    category,
    species,
    createdAt,
    createdBy,
    tags,
    fileUrls,
    thumbnailUrl,
    isApproved,
    modifiedAt,
    modifiedBy,
    sourceUrl,
    videoUrl,
    isDeleted
  } = result

  const downloadUrls = fileUrls
    .filter(isUrlNotAnImageOrVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const imageUrls = fileUrls
    .filter(isUrlAnImage)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const videoUrls = fileUrls
    .filter(isUrlAVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>
          {title} | Uploaded by {createdBy.username} | VRCArena
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
      {isApproved === false && <NotApprovedMessage />}
      {isDeleted === true && <DeletedMessage />}
      <div className={classes.thumbnailAndControls}>
        <div className={classes.thumbnailWrapper}>
          <AssetThumbnail url={thumbnailUrl} />
        </div>
        <div className={classes.controls}>
          <EndorseAssetButton assetId={id} />
          {sourceUrl && (
            <VisitSourceButton
              sourceUrl={sourceUrl}
              isNoFilesAttached={downloadUrls.length === 0}
            />
          )}
          {downloadUrls.length ? (
            <DownloadButton assetId={id} url={downloadUrls[0]} />
          ) : null}
        </div>
      </div>
      <Heading variant="h1">
        <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
          {title}
        </Link>
      </Heading>
      {species && category && (
        <Heading className={classes.subtitle} variant="h2">
          <Link
            to={routes.viewSpeciesWithVar.replace(':speciesName', species[0])}>
            {getSpeciesDisplayNameBySpeciesName(species[0])}
          </Link>
          {' - '}
          <Link
            to={routes.viewSpeciesCategoryWithVar
              .replace(':speciesName', species[0])
              .replace(':categoryName', category)}>
            {getCategoryDisplayName(category)}
          </Link>
        </Heading>
      )}

      {videoUrl && <VideoPlayer url={videoUrl} />}

      <div className={classes.description}>
        <Markdown source={description} />
      </div>

      {downloadUrls.length ? (
        <>
          <Heading variant="h2">Files</Heading>
          <FileList assetId={id} fileUrls={downloadUrls} />
        </>
      ) : null}

      {videoUrls.length ? (
        <>
          <Heading variant="h2">Videos</Heading>
          <FileList assetId={id} fileUrls={videoUrls} />
        </>
      ) : null}

      {imageUrls.length ? (
        <>
          <Heading variant="h2">Images</Heading>
          <ImageGallery urls={imageUrls} />
        </>
      ) : null}

      <Heading variant="h2">Meta</Heading>
      <div>
        {tags
          ? tags.map(tagName => <TagChip key={tagName} tagName={tagName} />)
          : '(no tags)'}
      </div>
      <Typography component="p" style={{ margin: '1rem 0' }}>
        Created {createdAt ? <FormattedDate date={createdAt} /> : '(unknown)'}{' '}
        by {createdBy ? createdBy.username : '(unknown)'}
      </Typography>
      {modifiedBy && (
        <Typography component="p" style={{ margin: '1rem 0' }}>
          Last modified <FormattedDate date={modifiedAt} /> by{' '}
          {modifiedBy ? modifiedBy.username : '(unknown)'}
        </Typography>
      )}
      <div>
        {small ? (
          <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
            <Button color="primary">View Asset</Button>
          </Link>
        ) : canEditAsset(user, createdBy) ? (
          <Link to={routes.editAssetWithVar.replace(':assetId', assetId)}>
            <Button color="primary" icon={<EditIcon />}>
              Edit Asset
            </Button>
          </Link>
        ) : null}
        {!isApproved && canApproveAsset(user) && (
          <ApproveBtn assetId={assetId} />
        )}
        {!isDeleted && canApproveAsset(user) && <DeleteBtn assetId={assetId} />}
      </div>
      <Heading variant="h2">Comments</Heading>
      <CommentList assetId={assetId} />
      <AddCommentForm assetId={assetId} />
      <Heading variant="h2">Endorsements</Heading>
      <EndorsementList assetId={assetId} />
    </div>
  )
}
