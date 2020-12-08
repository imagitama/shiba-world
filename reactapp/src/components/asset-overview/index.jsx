import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import EditIcon from '@material-ui/icons/Edit'
import ReportIcon from '@material-ui/icons/Report'
import LoyaltyIcon from '@material-ui/icons/Loyalty'
import HighlightIcon from '@material-ui/icons/Highlight'
import { useDispatch } from 'react-redux'
import LazyLoad from 'react-lazyload'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
  AssetFieldNames,
  DiscordServerFieldNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import { setBannerUrls as setBannerUrlsAction } from '../../modules/app'

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
import FeatureAssetButton from '../feature-asset-button'
import ImageGallery from '../image-gallery'
import AdminHistory from '../admin-history'
import ChangeSpeciesEditor from '../change-species-editor'
import OpenForCommissionsMessage from '../open-for-commissions-message'
import AssetAttachmentUploader from '../asset-attachment-uploader'
import TutorialStepsEditor from '../tutorial-steps-editor'
import TutorialSteps from '../tutorial-steps'
import PedestalUploadForm from '../pedestal-upload-form'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canApproveAsset,
  canEditAsset,
  canEditPedestal,
  isUrlAnImage,
  isUrlAVideo,
  isUrlNotAnImageOrVideo
} from '../../utils'
import { handleError } from '../../error-handling'
import {
  mediaQueryForTabletsOrBelow,
  mediaQueryForMobiles
} from '../../media-queries'
import { THUMBNAIL_WIDTH } from '../../config'

import NotApprovedMessage from './components/not-approved-message'
import DeletedMessage from './components/deleted-message'
import IsPrivateMessage from './components/is-private-message'
import FileList from './components/file-list'
import ReportMessage from './components/report-message'
import WorkInProgressMessage from './components/work-in-progress-message'
import ChildrenAssets from './components/children-assets'
import SpeciesOutput from './components/species-output'

import Pedestal from '../pedestal'
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
    width: '25%',
    flexShrink: 0,
    marginLeft: '5%',

    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      margin: '2rem 0 0'
    }
  },

  thumbAndTitle: {
    display: 'flex',
    flexDirection: 'row',

    [mediaQueryForMobiles]: {
      flexDirection: 'column'
    }
  },

  titlesWrapper: {
    paddingLeft: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [mediaQueryForMobiles]: {
      marginTop: '1rem'
    }
  },

  title: {
    margin: '0 0 0.5rem'
  },

  thumbnailWrapper: {
    flexShrink: 0,
    width: '200px',
    textAlign: 'center',

    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },

  thumbnail: {
    width: '100%',
    height: 'auto',
    maxWidth: `${THUMBNAIL_WIDTH}px`
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

    [mediaQueryForMobiles]: {
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
  },
  controlHint: {
    fontSize: '75%',
    display: 'block'
  },
  enableSpeciesEditorIcon: {
    paddingLeft: '5px',
    cursor: 'pointer',
    '& svg': {
      fontSize: '1rem'
    }
  },
  pedestalControls: {
    margin: '2rem 0',
    [mediaQueryForTabletsOrBelow]: {
      display: 'none'
    }
  }
})

const allSpeciesLabel = 'All Species'
const analyticsCategoryName = 'ViewAsset'

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

const actionCategory = 'ViewAsset'

// in future we need to serve up the fallback url but for now
// assume users are using modern browsers
const pickNonFallbackUrl = urlOrUrls => {
  if (typeof urlOrUrls === 'string') {
    return urlOrUrls
  }
  return urlOrUrls.url
}

export default ({ assetId }) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isReportMessageOpen, setIsReportMessageOpen] = useState(false)
  const [isSpeciesEditorOpen, setIsSpeciesEditorOpen] = useState(false)
  const [isAttachFileFormOpen, setIsAttachFileFormOpen] = useState(false)
  const [isTutorialStepsEditorOpen, setIsTutorialStepsEditorOpen] = useState(
    false
  )
  const [isEditingPedestal, setIsEditingPedestal] = useState(false)
  const hideChangeSpeciesTimeoutRef = useRef()

  const dispatch = useDispatch()
  const setBannerUrls = urls => dispatch(setBannerUrlsAction(urls))

  useEffect(() => {
    if (result && !result.title) {
      handleError(new Error(`Asset with ID ${assetId} does not exist`))
    }

    return () => {
      // avoid memory leak setting state on unmounted component
      clearTimeout(hideChangeSpeciesTimeoutRef.current)
    }
  }, [result ? result.title : null])

  useEffect(() => {
    if (
      !result ||
      !result[AssetFieldNames.bannerUrl] ||
      !result[AssetFieldNames.bannerUrl].url
    ) {
      return
    }

    setBannerUrls(result[AssetFieldNames.bannerUrl])

    return () => setBannerUrls({ url: '', fallbackUrl: '' })
  }, [result ? result.title : null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || result === null) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const {
    id,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.category]: category,
    [AssetFieldNames.species]: species,
    [AssetFieldNames.createdAt]: createdAt,
    [AssetFieldNames.createdBy]: createdBy,
    [AssetFieldNames.tags]: tags,
    [AssetFieldNames.fileUrls]: fileUrls,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.isApproved]: isApproved,
    [AssetFieldNames.lastModifiedAt]: lastModifiedAt,
    [AssetFieldNames.lastModifiedBy]: lastModifiedBy,
    [AssetFieldNames.sourceUrl]: sourceUrl,
    [AssetFieldNames.videoUrl]: videoUrl,
    [AssetFieldNames.isDeleted]: isDeleted,
    [AssetFieldNames.isAdult]: isAdult,
    [AssetFieldNames.isPrivate]: isPrivate,
    [AssetFieldNames.author]: author,
    [AssetFieldNames.children]: children,
    [AssetFieldNames.ownedBy]: ownedBy,
    [AssetFieldNames.discordServer]: discordServer,
    [AssetFieldNames.tutorialSteps]: tutorialSteps = [],
    [AssetFieldNames.pedestalVideoUrl]: pedestalVideoUrl,
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl
  } = result

  if (!title) {
    return (
      <ErrorMessage>Asset does not exist. Maybe it was deleted?</ErrorMessage>
    )
  }

  const downloadUrls = fileUrls
    .map(pickNonFallbackUrl)
    .filter(isUrlNotAnImageOrVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const imageUrls = fileUrls
    .map(pickNonFallbackUrl)
    .filter(isUrlAnImage)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const videoUrls = fileUrls
    .map(pickNonFallbackUrl)
    .filter(isUrlAVideo)
    .filter(fileUrl => fileUrl !== thumbnailUrl)

  const isApprover = canApproveAsset(user)
  const isOwnerOrEditor = canEditAsset(user, createdBy, ownedBy)
  const isAbleToEditPedestal = canEditPedestal(user, createdBy, ownedBy)

  const EnableSpeciesEditorIcon = () => {
    if (isOwnerOrEditor && !isSpeciesEditorOpen) {
      return (
        <span className={classes.enableSpeciesEditorIcon}>
          <EditIcon onClick={() => setIsSpeciesEditorOpen(true)} />
        </span>
      )
    }
    return null
  }

  const EnableAttachFileButton = () => {
    if (isOwnerOrEditor && !isAttachFileFormOpen) {
      return (
        <span>
          <Button
            onClick={() => setIsAttachFileFormOpen(true)}
            icon={<EditIcon />}
            color="default">
            Modify Attachments
          </Button>
        </span>
      )
    }
    return null
  }

  const onDoneChangingSpecies = () => {
    setTimeout(() => {
      setIsSpeciesEditorOpen(false)
    }, 2000)
  }

  if (isDeleted && !canApproveAsset(user)) {
    return <ErrorMessage>This asset has been deleted.</ErrorMessage>
  }

  const AssetTitle = () => (
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
                <SpeciesOutput species={species} />
                <EnableSpeciesEditorIcon />
                {' / '}
                <Link
                  to={routes.viewSpeciesCategoryWithVar
                    .replace(':speciesIdOrSlug', species[0].id)
                    .replace(':categoryName', category)}>
                  {getCategoryDisplayName(category)}
                </Link>
              </>
            ) : (
              <>
                {allSpeciesLabel}
                <EnableSpeciesEditorIcon /> -{' '}
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
  )

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

      {pedestalVideoUrl ? (
        <Pedestal
          videoUrl={pedestalVideoUrl}
          fallbackImageUrl={pedestalFallbackImageUrl}>
          <AssetTitle />
          <div className={classes.pedestalControls}>
            <VisitSourceButton
              assetId={assetId}
              sourceUrl={sourceUrl}
              categoryName={category}
              isNoFilesAttached={downloadUrls.length === 0}
            />
          </div>
          <div className={classes.description}>
            <Markdown source={description} />
          </div>
        </Pedestal>
      ) : (
        <div className={classes.thumbAndTitle}>
          <div className={classes.thumbnailWrapper}>
            <AssetThumbnail url={thumbnailUrl} className={classes.thumbnail} />
          </div>
          <div className={classes.titlesWrapper}>
            <AssetTitle />
          </div>
        </div>
      )}

      {isEditingPedestal && (
        <>
          <Heading variant="h3">Edit Pedestal</Heading>
          <PedestalUploadForm
            assetId={assetId}
            onDone={() => setIsEditingPedestal(false)}
          />
        </>
      )}

      {isSpeciesEditorOpen && (
        <>
          <Heading variant="h3">Change Species</Heading>
          <ChangeSpeciesEditor
            assetId={assetId}
            actionCategory={actionCategory}
            onDone={onDoneChangingSpecies}
          />
        </>
      )}

      {author &&
        author[AuthorFieldNames.isOpenForCommission] &&
        author[AuthorFieldNames.showOpenForCommissionsInAssets] && (
          <OpenForCommissionsMessage
            showViewAuthorButton
            authorId={author.id}
            analyticsCategory={analyticsCategoryName}
          />
        )}

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

          {pedestalVideoUrl ? null : (
            <div className={classes.description}>
              <Markdown source={description} />
            </div>
          )}

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

          {tutorialSteps.length ? (
            <>
              <Heading variant="h2">Steps</Heading>
              <TutorialSteps steps={tutorialSteps} />
            </>
          ) : null}

          {isAttachFileFormOpen ? (
            <>
              <AssetAttachmentUploader
                assetId={assetId}
                onDone={() => setIsAttachFileFormOpen(false)}
              />
            </>
          ) : isOwnerOrEditor ? (
            <EnableAttachFileButton />
          ) : null}

          {isTutorialStepsEditorOpen ? (
            <TutorialStepsEditor
              assetId={assetId}
              existingSteps={tutorialSteps}
              onSave={() => {
                setIsTutorialStepsEditorOpen(false)
              }}
            />
          ) : isOwnerOrEditor && category === AssetCategories.tutorial ? (
            <Button
              onClick={() => setIsTutorialStepsEditorOpen(true)}
              color="default"
              icon={<EditIcon />}>
              Edit Tutorial Steps
            </Button>
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
            {sourceUrl && !pedestalVideoUrl && (
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

            {isOwnerOrEditor ? (
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
                    actionCategory={actionCategory}
                  />
                </Control>
                <Control>
                  <span className={classes.controlHint}>
                    If you set the source to a Discord message that you need to
                    be invited to see, link it to a Discord server here (send a
                    message in our Discord to add yours)
                  </span>
                  <ChangeDiscordServerForm
                    collectionName={CollectionNames.Assets}
                    id={assetId}
                    actionCategory={actionCategory}
                  />
                </Control>
              </>
            ) : null}

            {isAbleToEditPedestal && isEditingPedestal === false ? (
              <>
                <Control>
                  <Button
                    onClick={() => setIsEditingPedestal(true)}
                    color="default"
                    icon={<HighlightIcon />}>
                    Set Pedestal
                  </Button>
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
                <FeatureAssetButton
                  assetId={assetId}
                  onClick={({ newValue }) =>
                    trackAction(
                      analyticsCategoryName,
                      newValue === true
                        ? 'Click feature asset button'
                        : 'Click unfeature asset button',
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

      {isOwnerOrEditor && (
        <LazyLoad>
          <Heading variant="h2">History</Heading>
          <AdminHistory assetId={assetId} limit={10} />
        </LazyLoad>
      )}
    </div>
  )
}
