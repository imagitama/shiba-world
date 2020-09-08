import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import EditIcon from '@material-ui/icons/Edit'
import ReportIcon from '@material-ui/icons/Report'
import LoyaltyIcon from '@material-ui/icons/Loyalty'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
  AssetFieldNames,
  DiscordServerFieldNames
} from '../../hooks/useDatabaseQuery'
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
import ApproveAssetButton from '../approve-asset-button'
import DeleteAssetButton from '../delete-asset-button'
import PinAssetButton from '../pin-asset-button'
import ImageGallery from '../image-gallery'
import ImagePlaceholder from '../image-placeholder'

import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import { trackAction } from '../../analytics'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canApproveAsset,
  canEditAsset,
  isUrlAnImage,
  isUrlAVideo,
  isUrlNotAnImageOrVideo
} from '../../utils'
import { handleError } from '../../error-handling'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

import NotApprovedMessage from './components/not-approved-message'
import DeletedMessage from './components/deleted-message'
import IsPrivateMessage from './components/is-private-message'
import FileList from './components/file-list'
import ReportMessage from './components/report-message'
import WorkInProgressMessage from './components/work-in-progress-message'
import ChildrenAssets from './components/children-assets'

import OwnerEditor from '../owner-editor'
import DownloadAssetButton from '../download-asset-button'
import VisitSourceButton from '../visit-source-button'
import ChangeDiscordServerForm from '../change-discord-server-form'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },

  cols: {
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForTabletsOrBelow]: {
      flexDirection: 'column'
    }
  },

  leftCol: {
    flex: 1
  },

  rightCol: {
    flexShrink: 0,
    marginLeft: '5%',

    [mediaQueryForTabletsOrBelow]: {
      margin: 0
    }
  },

  thumbAndTitle: {
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForTabletsOrBelow]: {
      flexDirection: 'column'
    }
  },

  titlesWrapper: {
    paddingLeft: '1rem',
    display: 'flex',
    alignItems: 'center'
  },

  title: {
    margin: '0 0 0.5rem'
  },

  thumbnailWrapper: {
    flexShrink: 0,
    width: '200px',

    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },

  thumbnail: {
    width: '100%',
    height: 'auto',
    maxWidth: '300px'
  },

  categoryMeta: {
    fontSize: '125%'
  },
  subtitle: {
    marginTop: '0.5rem'
  },
  description: {
    margin: '2rem 0 2rem',
    '& A': { textDecoration: 'underline' },
    '& img': { maxWidth: '100%' }
  },
  downloadButton: {
    '& a': {
      color: 'inherit'
    }
  },
  isAdultMsg: {
    fontSize: '33.3%'
  },
  createdByInTitle: {
    fontSize: '50%',

    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      display: 'block',
      marginTop: '0.5rem'
    }
  },
  control: {
    marginBottom: '0.5rem'
  },
  mobilePrimaryBtn: {
    display: 'none',

    [mediaQueryForTabletsOrBelow]: {
      display: 'block',
      marginTop: '1rem'
    }
  },
  noDownloadsMsg: {
    marginTop: '0.25rem',
    opacity: '0.5',
    display: 'block',
    textAlign: 'center'
  },
  discordServerInfo: {
    fontSize: '75%',
    marginBottom: '0.5rem'
  },
  banner: {
    marginBottom: '1rem',
    position: 'relative',
    '& img': {
      width: '100%',
      height: 'auto'
    },
    '& picture': {
      position: 'absolute',
      top: 0,
      left: 0
    }
  },
  meta: {
    fontSize: '75%',
    marginTop: '0.5rem'
  },
  tags: {
    marginTop: '1rem'
  },
  adultIndicator: {
    display: 'flex',
    alignItems: 'center'
  }
})

const allSpeciesLabel = 'All Species'
const analyticsCategoryName = 'ViewAsset'

function getSpeciesDisplayNameBySpeciesName(speciesName) {
  if (!speciesName) {
    return allSpeciesLabel
  }
  if (!speciesMeta[speciesName]) {
    throw new Error(`Unknown species name ${speciesName}`)
  }
  return speciesMeta[speciesName].name
}

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
}

function ReportButton({ assetId, onClick }) {
  const classes = useStyles()

  const onBtnClick = () => {
    onClick()
    trackAction(analyticsCategoryName, 'Click report button', {
      assetId
    })
  }

  return (
    <Button
      className={classes.controlBtn}
      color="default"
      icon={<ReportIcon />}
      onClick={onBtnClick}>
      Report
    </Button>
  )
}

function CreatedByMessage({ author }) {
  const classes = useStyles()

  return (
    <span className={classes.createdByInTitle}>
      {author ? (
        <>
          by{' '}
          <Link to={routes.viewAuthorWithVar.replace(':authorId', author.id)}>
            {author[AuthorFieldNames.name]}
          </Link>
        </>
      ) : null}
    </span>
  )
}

function Control({ children }) {
  const classes = useStyles()
  return <div className={classes.control}>{children}</div>
}

function DiscordServerInfo({ discordServer }) {
  const classes = useStyles()

  if (!discordServer) {
    return null
  }

  const {
    [DiscordServerFieldNames.name]: name,
    // [DiscordServerFieldNames.widgetId]: widgetId,
    // [DiscordServerFieldNames.iconUrl]: iconUrl,
    [DiscordServerFieldNames.inviteUrl]: inviteUrl,
    [DiscordServerFieldNames.requiresPatreon]: requiresPatreon,
    [DiscordServerFieldNames.patreonUrl]: patreonUrl
  } = discordServer

  return (
    <div className={classes.discordServerInfo}>
      To download this asset you must be a member of Discord server "{name}"
      <br />
      {requiresPatreon ? (
        <>
          You must be a Patreon:{' '}
          <a
            href={patreonUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackAction(
                analyticsCategoryName,
                'Click join Patreon link for Discord server',
                discordServer.id
              )
            }>
            Join Here
          </a>
        </>
      ) : (
        <>
          You must accept this invite:{' '}
          <a
            href={inviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackAction(
                analyticsCategoryName,
                'Click join Discord server link',
                discordServer.id
              )
            }>
            Join Here
          </a>
        </>
      )}
    </div>
  )
}

function MobilePrimaryBtn({
  downloadUrls,
  sourceUrl,
  assetId,
  categoryName,
  discordServer
}) {
  const classes = useStyles()

  // TODO: Use media query hook instead of css to show/hide
  return (
    <div className={classes.mobilePrimaryBtn}>
      {downloadUrls.length ? (
        <DownloadAssetButton
          assetId={assetId}
          url={downloadUrls[0]}
          isLarge={true}
          onClick={() =>
            trackAction(
              analyticsCategoryName,
              'Click mobile primary button - download',
              { url: downloadUrls[0], assetId }
            )
          }
        />
      ) : sourceUrl ? (
        <>
          <VisitSourceButton
            isLarge={true}
            assetId={assetId}
            sourceUrl={sourceUrl}
            categoryName={categoryName}
            isNoFilesAttached={downloadUrls.length === 0}
            onClick={() =>
              trackAction(
                analyticsCategoryName,
                'Click mobile primary button - visit source',
                { url: sourceUrl, assetId }
              )
            }
          />
        </>
      ) : null}
      <DiscordServerInfo discordServer={discordServer} />
    </div>
  )
}

function Banner({ imageUrls }) {
  const classes = useStyles()

  if (!imageUrls.url) {
    return 'Invalid format'
  }

  const { url, fallbackUrl } = imageUrls

  return (
    <div className={classes.banner}>
      <ImagePlaceholder width={1280} height={300} />
      <picture>
        <source srcSet={url} type="image/webp" />
        <source srcSet={fallbackUrl} type="image/png" />
        <img src={fallbackUrl} alt={'Banner for the asset'} />
      </picture>
    </div>
  )
}

export default ({ assetId }) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isReportMessageOpen, setIsReportMessageOpen] = useState(false)

  useEffect(() => {
    if (result && !result.title) {
      handleError(new Error(`Asset with ID ${assetId} does not exist`))
    }
  }, [result ? result.title : null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || result === null) {
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
    [AssetFieldNames.tags]: tags,
    fileUrls,
    thumbnailUrl,
    isApproved,
    lastModifiedAt,
    lastModifiedBy,
    sourceUrl,
    videoUrl,
    isDeleted,
    isAdult,
    isPrivate,
    [AssetFieldNames.author]: author,
    children,
    [AssetFieldNames.ownedBy]: ownedBy,
    [AssetFieldNames.discordServer]: discordServer,
    [AssetFieldNames.bannerUrl]: bannerUrl
  } = result

  if (!title) {
    return (
      <ErrorMessage>Asset does not exist. Maybe it was deleted?</ErrorMessage>
    )
  }

  const downloadUrls = fileUrls
    .filter(isUrlNotAnImageOrVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const imageUrls = fileUrls
    .filter(isUrlAnImage)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const videoUrls = fileUrls
    .filter(isUrlAVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const isApprover = canApproveAsset(user)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>
          {title} |{' '}
          {author ? `By ${author.name}` : `Uploaded by ${createdBy.username}`} |
          VRCArena
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
      {isApproved === false && <NotApprovedMessage />}
      {isDeleted === true && <DeletedMessage />}
      {isPrivate === true && <IsPrivateMessage />}
      {tags && tags.includes('wip') && <WorkInProgressMessage />}

      {bannerUrl && <Banner imageUrls={bannerUrl} />}

      <div className={classes.thumbAndTitle}>
        <div className={classes.thumbnailWrapper}>
          <AssetThumbnail url={thumbnailUrl} className={classes.thumbnail} />
        </div>
        <div className={classes.titlesWrapper}>
          <div>
            <Heading variant="h1" className={classes.title}>
              <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
                {title}
              </Link>{' '}
              <CreatedByMessage
                author={author}
                createdBy={createdBy}
                categoryName={category}
              />
            </Heading>
            <div className={classes.categoryMeta}>
              {category && (
                <div>
                  {species.length ? (
                    <>
                      <Link
                        to={routes.viewSpeciesWithVar.replace(
                          ':speciesName',
                          species[0]
                        )}>
                        {getSpeciesDisplayNameBySpeciesName(species[0])}
                      </Link>
                      {' / '}
                      <Link
                        to={routes.viewSpeciesCategoryWithVar
                          .replace(':speciesName', species[0])
                          .replace(':categoryName', category)}>
                        {getCategoryDisplayName(category)}
                      </Link>
                    </>
                  ) : (
                    <>
                      {allSpeciesLabel} -{' '}
                      <Link
                        to={routes.viewCategoryWithVar.replace(
                          ':categoryName',
                          category
                        )}>
                        {getCategoryDisplayName(category)}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <MobilePrimaryBtn
        downloadUrls={downloadUrls}
        sourceUrl={sourceUrl}
        assetId={assetId}
        categoryName={category}
        discordServer={discordServer}
      />

      <div className={classes.cols}>
        <div className={classes.leftCol}>
          {videoUrl && <VideoPlayer url={videoUrl} />}

          <div className={classes.description}>
            <Markdown source={description} />
          </div>

          {downloadUrls.length ? (
            <>
              <FileList assetId={id} fileUrls={downloadUrls} />
            </>
          ) : null}

          {videoUrls.length ? (
            <>
              <FileList assetId={id} fileUrls={videoUrls} />
            </>
          ) : null}

          {imageUrls.length ? (
            <>
              <ImageGallery
                urls={imageUrls}
                onOpen={() =>
                  trackAction(
                    analyticsCategoryName,
                    'Click attached image thumbnail to open gallery'
                  )
                }
                onMoveNext={() =>
                  trackAction(
                    analyticsCategoryName,
                    'Click go next image in gallery'
                  )
                }
                onMovePrev={() =>
                  trackAction(
                    analyticsCategoryName,
                    'Click go prev image in gallery'
                  )
                }
              />
            </>
          ) : null}

          {children && children.length ? (
            <>
              <Heading variant="h2">Linked Assets</Heading>
              <ChildrenAssets assetChildren={children} />
            </>
          ) : null}

          <div className={classes.tags}>
            {tags
              ? tags.map(tagName => <TagChip key={tagName} tagName={tagName} />)
              : '(no tags)'}
          </div>
        </div>

        <div className={classes.rightCol}>
          <div className={classes.controls}>
            {sourceUrl && (
              <Control>
                <VisitSourceButton
                  assetId={assetId}
                  sourceUrl={sourceUrl}
                  categoryName={category}
                  isNoFilesAttached={downloadUrls.length === 0}
                />
              </Control>
            )}
            {downloadUrls.length ? (
              <Control>
                <DownloadAssetButton
                  assetId={id}
                  url={downloadUrls[0]}
                  onClick={() =>
                    trackAction(
                      analyticsCategoryName,
                      'Click download asset button',
                      { url: downloadUrls[0], assetId: id }
                    )
                  }
                />
              </Control>
            ) : null}
            <DiscordServerInfo discordServer={discordServer} />
            <Control>
              <ReportButton
                assetId={id}
                onClick={() => setIsReportMessageOpen(true)}
              />
            </Control>
            <Control>
              <EndorseAssetButton
                assetId={id}
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
            {discordServer && (
              <Control>
                <Button
                  url={routes.viewDiscordServerWithVar.replace(
                    ':discordServerId',
                    discordServer.id
                  )}
                  color="default">
                  Discord Server Info
                </Button>
              </Control>
            )}

            <div className={classes.meta}>
              <div>
                Uploaded{' '}
                {createdAt ? <FormattedDate date={createdAt} /> : '(unknown)'}{' '}
                by{' '}
                {createdBy ? (
                  <Link
                    to={routes.viewUserWithVar.replace(
                      ':userId',
                      createdBy.id
                    )}>
                    {createdBy.username}
                  </Link>
                ) : (
                  '(unknown)'
                )}
              </div>
              {lastModifiedBy && (
                <div>
                  Last modified <FormattedDate date={lastModifiedAt} /> by{' '}
                  {lastModifiedBy ? (
                    <Link
                      to={routes.viewUserWithVar.replace(
                        ':userId',
                        lastModifiedBy.id
                      )}>
                      {lastModifiedBy.username}
                    </Link>
                  ) : (
                    '(unknown)'
                  )}
                </div>
              )}
              {ownedBy && (
                <div>
                  Owned by{' '}
                  <Link
                    to={routes.viewUserWithVar.replace(':userId', ownedBy.id)}>
                    {ownedBy.username}
                  </Link>
                </div>
              )}
              {isAdult && (
                <div className={classes.adultIndicator}>
                  <LoyaltyIcon /> NSFW
                </div>
              )}
            </div>

            {canEditAsset(user, createdBy, ownedBy) ? (
              <>
                <Heading variant="h4">Owner Actions</Heading>
                <Control>
                  <Button
                    url={routes.editAssetWithVar.replace(':assetId', assetId)}
                    color="default"
                    icon={<EditIcon />}>
                    Edit Asset
                  </Button>
                </Control>
                <Control>
                  <OwnerEditor
                    collectionName={CollectionNames.Assets}
                    id={assetId}
                    actionCategory="ViewAsset"
                  />
                </Control>
                <Control>
                  <ChangeDiscordServerForm
                    collectionName={CollectionNames.Assets}
                    id={assetId}
                    actionCategory="ViewAsset"
                  />
                </Control>
              </>
            ) : null}
            {isApprover && <Heading variant="h4">Editor Actions</Heading>}
            {isApprover && (
              <Control>
                <ApproveAssetButton assetId={assetId} />
              </Control>
            )}
            {isApprover && (
              <Control>
                <DeleteAssetButton
                  assetId={assetId}
                  onClick={({ newValue }) =>
                    trackAction(
                      analyticsCategoryName,
                      newValue === true
                        ? 'Click delete asset button'
                        : 'Click undelete asset button',
                      assetId
                    )
                  }
                />
              </Control>
            )}
            {isApprover && (
              <Control>
                <PinAssetButton
                  assetId={assetId}
                  onClick={({ newValue }) =>
                    trackAction(
                      analyticsCategoryName,
                      newValue === true
                        ? 'Click pin asset button'
                        : 'Click unpin asset button',
                      assetId
                    )
                  }
                />
              </Control>
            )}
          </div>
        </div>
      </div>

      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={CollectionNames.Assets} parentId={assetId} />
      <AddCommentForm
        collectionName={CollectionNames.Assets}
        parentId={assetId}
        onAddClick={() =>
          trackAction(analyticsCategoryName, 'Click add comment button', {
            assetId
          })
        }
      />
    </div>
  )
}
