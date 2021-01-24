import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import EditIcon from '@material-ui/icons/Edit'
import LoyaltyIcon from '@material-ui/icons/Loyalty'
import ControlCameraIcon from '@material-ui/icons/ControlCamera'
import LaunchIcon from '@material-ui/icons/Launch'
import LazyLoad from 'react-lazyload'
import { useDispatch } from 'react-redux'
import SyncIcon from '@material-ui/icons/Sync'

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
import TagChip from '../tag-chip'
import Heading from '../heading'
import Button from '../button'
import VideoPlayer from '../video-player'
import ApproveAssetButton from '../approve-asset-button'
import DeleteAssetButton from '../delete-asset-button'
import PinAssetButton from '../pin-asset-button'
import FeatureAssetButton from '../feature-asset-button'
import ImageGallery from '../image-gallery'
import AdminHistory from '../admin-history'
import ChangeSpeciesEditor from '../change-species-editor'
import AssetAttachmentUploader from '../asset-attachment-uploader'
import TutorialStepsEditor from '../tutorial-steps-editor'
import TutorialSteps from '../tutorial-steps'
import PedestalUploadForm from '../pedestal-upload-form'
import ThumbnailUploader from '../thumbnail-uploader'
import AssetTitleEditor from '../asset-title-editor'
import AssetTagsEditor from '../asset-tags-editor'
import Paper from '../paper'
import ToggleAdultForm from '../toggle-adult-form'
import AssetSourceEditor from '../asset-source-editor'
import SyncWithGumroadForm from '../sync-with-gumroad-form'

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
  isUrlNotAnImageOrVideo,
  isGumroadUrl
} from '../../utils'
import { handleError } from '../../error-handling'
import {
  mediaQueryForTabletsOrBelow,
  mediaQueryForMobiles
} from '../../media-queries'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, formHideDelay } from '../../config'

import FileList from '../asset-overview/components/file-list'
import ChildrenAssets from '../asset-overview/components/children-assets'
import SpeciesOutput from '../asset-overview/components/species-output'
import VideoList from '../asset-overview/components/video-list'

import Pedestal from '../pedestal'
import OwnerEditor from '../owner-editor'
import ChangeAuthorForm from '../change-author-form'
import DownloadAssetButton from '../download-asset-button'
import VisitSourceButton from '../visit-source-button'
import ChangeDiscordServerForm from '../change-discord-server-form'
import SketchfabEmbed from '../sketchfab-embed'
import SketchfabEmbedEditor from '../sketchfab-embed-editor'
import AssetAmendments from '../asset-amendments'
import DescriptionEditor from '../description-editor'
import TogglePrivateForm from '../toggle-private-form'

import placeholderPedestalVideoUrl from '../../assets/videos/placeholder-pedestal.webm'
import placeholderPedestalFallbackImageUrl from '../../assets/videos/placeholder-pedestal-fallback.webp'
import ScrollToMe from '../scroll-to-me'
import AssetBannerEditor from '../asset-banner-editor'
import ChangeCategoryForm from '../change-category-form'
import EditImageIcon from '../edit-image-icon'

const useStyles = makeStyles(theme => ({
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
    position: 'relative',
    flexShrink: 0,
    width: '200px',
    height: '200px',
    textAlign: 'center',

    [mediaQueryForMobiles]: {
      width: '100%',
      height: 'auto'
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
  },
  pedestalDiscordServerInfo: {
    marginTop: '0.5rem',
    opacity: 0.5,
    '&:hover': {
      cursor: 'default',
      opacity: 1
    }
  },
  sketchfabEmbed: {
    width: '100%',
    height: '400px'
  },
  viewSketchfabEmbedBtn: {
    textAlign: 'center',
    padding: '1rem 0 0'
  },

  // EDITOR VIEW

  editThumbnailIcon: {
    width: '40px',
    height: '40px',
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    padding: '5px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  editIcon: {
    cursor: 'pointer',
    color: theme.palette.tertiary.main
    // stroke: '#FFF',
    // strokeWidth: '1px'
  },
  editBannerBtn: {
    textAlign: 'center',
    padding: '1rem'
  },
  editorHeading: {
    marginTop: 0
  }
}))

const analyticsCategoryName = 'ViewAssetEditor'

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
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

const EditButton = ({ onClick, editingName, analyticsAction }) => (
  <Button
    onClick={() => {
      if (analyticsAction) {
        trackAction(analyticsCategoryName, analyticsAction)
      }
      onClick()
    }}
    icon={<EditIcon />}
    color="tertiary">
    Edit{editingName ? ` ${editingName}` : ''}
  </Button>
)

// in future we need to serve up the fallback url but for now
// assume users are using modern browsers
const pickNonFallbackUrl = urlOrUrls => {
  if (typeof urlOrUrls === 'string') {
    return urlOrUrls
  }
  return urlOrUrls.url
}

export default ({ assetId, switchEditorOpen }) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId,
    undefined,
    undefined,
    true,
    undefined,
    true
  )
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [isSpeciesEditorOpen, setIsSpeciesEditorOpen] = useState(false)
  const [isAttachFileFormOpen, setIsAttachFileFormOpen] = useState(false)
  const [isTutorialStepsEditorOpen, setIsTutorialStepsEditorOpen] = useState(
    false
  )
  const [isEditingPedestal, setIsEditingPedestal] = useState(false)
  const [isSketchfabEmbedVisible, setIsSketchfabEmbedVisible] = useState(false)
  const [isEditingSketchfabEmbed, setIsEditingSketchfabEmbed] = useState(false)
  const [isThumbnailEditorOpen, setIsThumbnailEditorOpen] = useState(false)
  const [isTagEditorOpen, setIsTagEditorOpen] = useState(false)
  const [isTitleEditorOpen, setIsTitleEditorOpen] = useState(false)
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false)
  const [isSourceUrlEditorOpen, setIsSourceUrlEditorOpen] = useState(false)
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false)
  const [isChildrenEditorOpen, setIsChildrenEditorOpen] = useState(false)
  const [isSyncWithGumroadFormOpen, setIsSyncWithGumroadFormOpen] = useState(
    false
  )
  const hideChangeSpeciesTimeoutRef = useRef()

  const dispatch = useDispatch()
  const setBannerUrls = urls => dispatch(setBannerUrlsAction(urls))
  const unloadBannerOnUnmountRef = useRef(true)

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
    if (!result || !result[AssetFieldNames.bannerUrl]) {
      return
    }

    setBannerUrls({ url: result[AssetFieldNames.bannerUrl] })

    return () => {
      // if switching to edit mode do not unload
      if (unloadBannerOnUnmountRef.current) {
        setBannerUrls({ url: '' })
      }
    }
  }, [result ? result[AssetFieldNames.bannerUrl] : null])

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
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl,
    [AssetFieldNames.sketchfabEmbedUrl]: sketchfabEmbedUrl
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
          <EditIcon
            onClick={() => {
              trackAction(analyticsCategoryName, 'Click edit species icon')
              setIsSpeciesEditorOpen(true)
            }}
            className={classes.editIcon}
          />
        </span>
      )
    }
    return null
  }

  if (isDeleted && !canApproveAsset(user)) {
    return <ErrorMessage>This asset has been deleted.</ErrorMessage>
  }

  const EditCategoryIcon = () => (
    <EditIcon
      onClick={() => {
        trackAction(analyticsCategoryName, 'Click edit category icon')
        setIsCategoryEditorOpen(true)
      }}
      className={classes.editIcon}
    />
  )

  const AssetTitle = () => (
    <div>
      <Heading variant="h1" className={classes.title}>
        {isTitleEditorOpen ? (
          <AssetTitleEditor
            title={title}
            assetId={assetId}
            actionCategory={analyticsCategoryName}
            onDone={() => setIsTitleEditorOpen(false)}
          />
        ) : (
          <>
            <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
              {title}
            </Link>{' '}
            <EditIcon
              onClick={() => {
                trackAction(analyticsCategoryName, 'Click edit title icon')
                setIsTitleEditorOpen(true)
              }}
              className={classes.editIcon}
            />
          </>
        )}{' '}
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
                </Link>{' '}
                <EditCategoryIcon />
              </>
            ) : (
              <>
                {isOwnerOrEditor && '(no species)'}
                <EnableSpeciesEditorIcon />
                <Link
                  to={routes.viewCategoryWithVar.replace(
                    ':categoryName',
                    category
                  )}>
                  {getCategoryDisplayName(category)}
                </Link>{' '}
                <EditCategoryIcon />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const ViewSketchfabEmbedButton = () =>
    sketchfabEmbedUrl ? (
      <>
        <Button
          onClick={() => {
            setIsSketchfabEmbedVisible(!isSketchfabEmbedVisible)
            trackAction(
              analyticsCategoryName,
              'Click view 3D model button',
              assetId
            )
          }}
          icon={<ControlCameraIcon />}
          color="default">
          Toggle 3D Model
        </Button>
      </>
    ) : null

  const Description = () => {
    const [isDescriptionEditorOpen, setIsDescriptionEditorOpen] = useState(
      false
    )
    const [temporaryDescription, setTemporaryDescription] = useState()
    return (
      <div className={classes.description}>
        {isSketchfabEmbedVisible && (
          <SketchfabEmbed
            url={sketchfabEmbedUrl}
            className={classes.sketchfabEmbed}
          />
        )}
        <Markdown source={temporaryDescription || description} />
        {isDescriptionEditorOpen ? (
          <DescriptionEditor
            assetId={assetId}
            description={description}
            actionCategory={analyticsCategoryName}
            onChange={desc => setTemporaryDescription(desc)}
            onDone={() => {
              setTemporaryDescription(null)
              setIsDescriptionEditorOpen(false)
            }}
          />
        ) : (
          <EditButton
            onClick={() => {
              trackAction(
                analyticsCategoryName,
                'Click edit description button'
              )
              setIsDescriptionEditorOpen(true)
            }}
            editingName="Description"
          />
        )}
      </div>
    )
  }

  const PedestalChild = () => (
    <>
      <AssetThumbnail />
      <AssetTitle />
      <div className={classes.pedestalControls}>
        <VisitSourceButton
          assetId={assetId}
          sourceUrl={sourceUrl}
          categoryName={category}
          isNoFilesAttached={downloadUrls.length === 0}
        />{' '}
        <ViewSketchfabEmbedButton />
        {discordServer && (
          <div className={classes.pedestalDiscordServerInfo}>
            <DiscordServerInfo discordServer={discordServer} />
          </div>
        )}
      </div>
      <Description />
    </>
  )

  const AssetThumbnail = () => (
    <div className={classes.thumbnailWrapper}>
      <img
        src={thumbnailUrl}
        width={THUMBNAIL_WIDTH}
        height={THUMBNAIL_HEIGHT}
        alt="Thumbnail for asset"
        className={classes.thumbnail}
      />
      {isOwnerOrEditor && (
        <EditImageIcon
          onClick={() => {
            trackAction(analyticsCategoryName, 'Click edit thumbnail icon')
            setIsThumbnailEditorOpen(true)
          }}
        />
      )}
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

      {isBannerEditorOpen ? (
        <>
          <Heading variant="h3">Upload Banner</Heading>
          <AssetBannerEditor
            assetId={assetId}
            actionCategory={analyticsCategoryName}
            onDone={() => setIsBannerEditorOpen(false)}
          />
        </>
      ) : (
        <div className={classes.editBannerBtn}>
          <EditButton
            onClick={() => {
              trackAction(analyticsCategoryName, 'Click edit banner button')
              setIsBannerEditorOpen(true)
            }}
            editingName="Banner"
          />
        </div>
      )}

      {isAbleToEditPedestal ? (
        isEditingPedestal ? (
          <PedestalUploadForm
            assetId={assetId}
            onDone={() => setIsEditingPedestal(false)}
            onCancel={() => setIsEditingPedestal(false)}
            actionCategory={analyticsCategoryName}>
            <PedestalChild />
          </PedestalUploadForm>
        ) : (
          <Pedestal
            videoUrl={pedestalVideoUrl || placeholderPedestalVideoUrl}
            fallbackImageUrl={
              pedestalFallbackImageUrl || placeholderPedestalFallbackImageUrl
            }
            showEditIcon
            onEdit={() => {
              trackAction(analyticsCategoryName, 'Click edit pedestal icon')
              setIsEditingPedestal(true)
            }}>
            <PedestalChild />
          </Pedestal>
        )
      ) : (
        <div className={classes.thumbAndTitle}>
          <AssetThumbnail />
          <div className={classes.titlesWrapper}>
            <AssetTitle />
          </div>
        </div>
      )}

      {isThumbnailEditorOpen && (
        <ScrollToMe>
          <Heading variant="h3" className={classes.editorHeading}>
            Edit Thumbnail
          </Heading>
          <ThumbnailUploader
            assetId={assetId}
            analyticsCategory={analyticsCategoryName}
            onDone={() => setIsThumbnailEditorOpen(false)}
          />
        </ScrollToMe>
      )}

      {isSpeciesEditorOpen && (
        <ScrollToMe>
          <Paper>
            <Heading variant="h3" className={classes.editorHeading}>
              Change Species
            </Heading>
            <ChangeSpeciesEditor
              assetId={assetId}
              actionCategory={analyticsCategoryName}
              onDone={() => {
                // todo: clearTimeout on unmount to avoid leak
                setTimeout(() => {
                  setIsSpeciesEditorOpen(false)
                }, formHideDelay)
              }}
            />
          </Paper>
        </ScrollToMe>
      )}

      {isCategoryEditorOpen && (
        <ScrollToMe>
          <Paper>
            <Heading variant="h3" className={classes.editorHeading}>
              Change Category
            </Heading>
            <ChangeCategoryForm
              assetId={assetId}
              existingCategory={category}
              actionCategory={analyticsCategoryName}
              onDone={() => setIsCategoryEditorOpen(false)}
            />
          </Paper>
        </ScrollToMe>
      )}

      {isSourceUrlEditorOpen && (
        <ScrollToMe>
          <Paper>
            <Heading variant="h3" className={classes.editorHeading}>
              Change Source
            </Heading>
            <AssetSourceEditor
              assetId={assetId}
              sourceUrl={sourceUrl}
              actionCategory={analyticsCategoryName}
              onDone={() => setIsSourceUrlEditorOpen(false)}
            />
          </Paper>
        </ScrollToMe>
      )}

      {isEditingSketchfabEmbed && (
        <ScrollToMe>
          <Heading variant="h3">Embed Sketchfab</Heading>
          <SketchfabEmbedEditor
            assetId={assetId}
            sketchfabEmbedUrl={sketchfabEmbedUrl}
            actionCategory={analyticsCategoryName}
            onDone={() => setIsEditingSketchfabEmbed(false)}
          />
        </ScrollToMe>
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

          {isAbleToEditPedestal ? null : (
            <>
              {sketchfabEmbedUrl ? (
                <div className={classes.viewSketchfabEmbedBtn}>
                  <ViewSketchfabEmbedButton />
                </div>
              ) : null}
              <Description />
            </>
          )}

          {isAttachFileFormOpen ? (
            <>
              <Heading variant="h3">Attach Files</Heading>
              <AssetAttachmentUploader
                assetId={assetId}
                actionCategory={analyticsCategoryName}
                onDone={() => setIsAttachFileFormOpen(false)}
              />
            </>
          ) : (
            <>
              {downloadUrls.length ? (
                <>
                  <FileList assetId={id} fileUrls={downloadUrls} />
                </>
              ) : null}

              {videoUrls.length ? (
                <>
                  <VideoList assetId={id} urls={videoUrls} />
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

              <br />
              <br />

              {!isAttachFileFormOpen && (
                <EditButton
                  onClick={() => {
                    setIsAttachFileFormOpen(true)
                  }}
                  editingName="Attachments"
                  analyticsAction="Click edit attachments button"
                />
              )}
            </>
          )}

          {tutorialSteps.length ? (
            <>
              <Heading variant="h2">Steps</Heading>
              <TutorialSteps steps={tutorialSteps} />
            </>
          ) : null}

          {isTutorialStepsEditorOpen ? (
            <ScrollToMe>
              <TutorialStepsEditor
                assetId={assetId}
                existingSteps={tutorialSteps}
                onSave={() => {
                  setIsTutorialStepsEditorOpen(false)
                }}
                actionCategory={analyticsCategoryName}
              />
            </ScrollToMe>
          ) : isOwnerOrEditor && category === AssetCategories.tutorial ? (
            <EditButton
              onClick={() => {
                trackAction(
                  analyticsCategoryName,
                  'Click edit tutorial steps button'
                )
                setIsTutorialStepsEditorOpen(true)
              }}
              editingName="Tutorial Steps"
            />
          ) : null}

          {isGumroadUrl(sourceUrl) ? (
            isSyncWithGumroadFormOpen ? (
              <SyncWithGumroadForm
                assetId={assetId}
                gumroadUrl={sourceUrl}
                onDone={() => {
                  setIsSyncWithGumroadFormOpen(false)
                }}
              />
            ) : (
              <Button
                onClick={() => {
                  trackAction(
                    analyticsCategoryName,
                    'Click toggle sync gumroad button'
                  )
                  setIsSyncWithGumroadFormOpen(true)
                }}
                color="tertiary"
                icon={<SyncIcon />}>
                Sync With Gumroad
              </Button>
            )
          ) : null}

          {isChildrenEditorOpen ? (
            <>
              <Heading variant="h3" className={classes.editorHeading}>
                Change Linked Assets
              </Heading>
              {/* <ChangeAssetChildrenForm
                assetId={assetId}
                assetChildren={children}
                onDone={() => setIsChildrenEditorOpen(false)}
                actionCategory={analyticsCategoryName}
              /> */}
              <p>
                Not available at this time. Please contact a staff member in our
                Discord server or Tweet to us about it.
              </p>
            </>
          ) : (
            <>
              <Heading variant="h2">Linked Assets</Heading>
              <ChildrenAssets assetChildren={children} />
              <EditButton
                onClick={() => setIsChildrenEditorOpen(true)}
                editingName="Linked Assets"
                analyticsAction="Click edit linked assets button"
              />
            </>
          )}

          <div className={classes.tags}>
            {!isTagEditorOpen ? (
              <>
                {tags
                  ? tags.map(tagName => (
                      <TagChip key={tagName} tagName={tagName} />
                    ))
                  : '(no tags)'}
                <br />
                <EditButton
                  onClick={() => setIsTagEditorOpen(true)}
                  editingName="Tags"
                  analyticsAction="Click edit tags button"
                />
              </>
            ) : (
              <Paper>
                <Heading variant="h3" className={classes.editorHeading}>
                  Edit Tags
                </Heading>
                <AssetTagsEditor
                  assetId={assetId}
                  tags={tags}
                  onDone={() => setIsTagEditorOpen(false)}
                  actionCategory={analyticsCategoryName}
                />
              </Paper>
            )}
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
            {!pedestalVideoUrl && (
              <DiscordServerInfo discordServer={discordServer} />
            )}
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

            <>
              <Heading variant="h4">Owner Actions</Heading>
              <Control>
                <Button
                  onClick={() => {
                    trackAction(
                      analyticsCategoryName,
                      'Click switch editor button'
                    )

                    unloadBannerOnUnmountRef.current = false
                    switchEditorOpen()
                  }}
                  color="default"
                  icon={<EditIcon />}>
                  Return To View
                </Button>
              </Control>
              <Control>
                <Button
                  onClick={() => {
                    trackAction(
                      analyticsCategoryName,
                      'Click toggle source URL editor'
                    )
                    setIsSourceUrlEditorOpen(!isSourceUrlEditorOpen)
                  }}
                  color="tertiary"
                  icon={<LaunchIcon />}>
                  Change Source URL
                </Button>
              </Control>
              <Control>
                <ToggleAdultForm assetId={assetId} isAdult={isAdult} />
              </Control>
              <Control>
                <TogglePrivateForm assetId={assetId} isPrivate={isPrivate} />
              </Control>
              <Control>
                <OwnerEditor
                  collectionName={CollectionNames.Assets}
                  id={assetId}
                  actionCategory={analyticsCategoryName}
                />
              </Control>
              <Control>
                <ChangeAuthorForm
                  collectionName={CollectionNames.Assets}
                  id={assetId}
                  actionCategory={analyticsCategoryName}
                />
              </Control>
              <Control>
                <span className={classes.controlHint}>
                  If you set the source to a Discord message that you need to be
                  invited to see, link it to a Discord server here (send a
                  message in our Discord to add yours)
                </span>
                <ChangeDiscordServerForm
                  collectionName={CollectionNames.Assets}
                  id={assetId}
                  actionCategory={analyticsCategoryName}
                />
              </Control>
              <Control>
                <Button
                  onClick={() => setIsEditingSketchfabEmbed(true)}
                  icon={<ControlCameraIcon />}
                  color="tertiary">
                  Embed Sketchfab
                </Button>
              </Control>
            </>

            {isAbleToEditPedestal || true ? (
              <>
                <Control>
                  {isAdult ? (
                    'You can not feature adult assets'
                  ) : !isApproved ? (
                    'You can not feature unapproved assets'
                  ) : isDeleted ? (
                    'You cannot feature deleted assets'
                  ) : (
                    <FeatureAssetButton
                      assetId={assetId}
                      onClick={() =>
                        trackAction(
                          analyticsCategoryName,
                          'Click feature asset button',
                          assetId
                        )
                      }
                    />
                  )}
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

      {isOwnerOrEditor && (
        <LazyLoad>
          <Heading variant="h2">History</Heading>
          <AdminHistory assetId={assetId} limit={10} />
        </LazyLoad>
      )}

      {isOwnerOrEditor && (
        <LazyLoad>
          <Heading variant="h2">Amendments</Heading>
          <AssetAmendments assetId={assetId} />
        </LazyLoad>
      )}
    </div>
  )
}
