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
import AttachFileIcon from '@material-ui/icons/AttachFile'
import LinkIcon from '@material-ui/icons/Link'
import LocalOfferIcon from '@material-ui/icons/LocalOffer'
import TextFormatIcon from '@material-ui/icons/TextFormat'
import PetsIcon from '@material-ui/icons/Pets'
import CategoryIcon from '@material-ui/icons/Category'
import CopyrightIcon from '@material-ui/icons/Copyright'
import ImageIcon from '@material-ui/icons/Image'
import PanoramaIcon from '@material-ui/icons/Panorama'
import ReceiptIcon from '@material-ui/icons/Receipt'
import BugReportIcon from '@material-ui/icons/BugReport'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
  AssetFieldNames,
  DiscordServerFieldNames,
  AssetCategories,
  options,
  SpeciesFieldNames
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
import ToggleAdultForm from '../toggle-adult-form'
import AssetSourceEditor from '../asset-source-editor'
import SyncWithGumroadForm from '../sync-with-gumroad-form'
import LinkedAssetsEditor from '../linked-assets-editor'
import SlugEditor from '../slug-editor'

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
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  formHideDelay,
  WEBSITE_FULL_URL
} from '../../config'

import FileList from '../asset-overview/components/file-list'
import ChildrenAssets from '../asset-overview/components/children-assets'
import SpeciesOutput from '../asset-overview/components/species-output'
import VideoList from '../asset-overview/components/video-list'

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
import AssetBannerEditor from '../asset-banner-editor'
import ChangeCategoryForm from '../change-category-form'
import EditImageIcon from '../edit-image-icon'
import PedestalColumns from '../pedestal-columns'
import PedestalVideo from '../pedestal-video'

const editorAreaBorderValue = '3px dashed rgba(255, 255, 255, 0.5)'

const useStyles = makeStyles(() => ({
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

  titleField: {
    borderBottom: editorAreaBorderValue
  },

  thumbnailWrapper: {
    position: 'relative',
    flexShrink: 0,
    width: '200px',
    height: '200px',
    textAlign: 'center',
    marginBottom: '1rem',

    [mediaQueryForMobiles]: {
      width: '100%',
      height: 'auto'
    }
  },

  thumbnail: {
    width: '100%',
    height: 'auto',
    maxWidth: `${THUMBNAIL_WIDTH}px`,
    display: 'block'
  },

  categoryMeta: {
    fontSize: '125%',
    '& > div': {
      display: 'flex',
      alignItems: 'center'
    }
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
    color: '#FFF',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '4px',
    borderRadius: '100%',
    fontSize: '24px',
    transition: 'all 100ms',
    marginLeft: '5px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)'
    }
  },
  editBannerBtn: {
    textAlign: 'center',
    padding: '1rem'
  },
  editorHeading: {
    marginTop: 0
  },
  editorArea: {
    position: 'relative',
    marginBottom: '1rem',
    padding: '1rem',
    border: editorAreaBorderValue,
    transition: 'all 100ms',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.02)'
    // '&:hover': {
    //   borderColor: 'rgba(255, 255, 255, 1)'
    // }
  },
  noPadding: {
    padding: 0
  },
  editorAreaLabel: {
    textAlign: 'center',
    fontSize: '125%',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editorAreaIcon: {
    fontSize: '100%',
    marginLeft: '0.5rem'
  },
  editorAreaEditIcon: {
    width: '40px',
    height: '40px',
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '5px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'all 100ms',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.4)'
    }
  },
  syncGumroadForm: {
    marginTop: '1rem'
  },
  slug: {
    textDecoration: 'underline'
  }
}))

const analyticsCategoryName = 'ViewAssetEditor'

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
}

function EditorArea({
  label,
  children,
  icon: Icon,
  onPencilClick,
  analyticsAction,
  noPadding,
  editor: Editor = null,
  waiting: Waiting = null
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const classes = useStyles()
  return (
    <div
      className={`${classes.editorArea} ${noPadding ? classes.noPadding : ''}`}>
      {label && (
        <div className={classes.editorAreaLabel}>
          {label} {Icon && <Icon className={classes.editorAreaIcon} />}
        </div>
      )}
      {Editor ? (
        isEditorOpen ? (
          React.createElement(Editor, {
            toggleEditor: () => setIsEditorOpen(!isEditorOpen)
          })
        ) : (
          <Waiting />
        )
      ) : (
        children
      )}
      {(onPencilClick || Editor) && (
        <div
          className={classes.editorAreaEditIcon}
          onClick={() => {
            if (analyticsAction) {
              trackAction(analyticsCategoryName, analyticsAction)
            }

            if (onPencilClick) {
              onPencilClick()
            } else if (Editor) {
              setIsEditorOpen(!isEditorOpen)
            }
          }}>
          <EditIcon />
        </div>
      )}
    </div>
  )
}

function CreatedByMessage({ author, onEditClick }) {
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
      ) : (
        '(no author set)'
      )}{' '}
      <EditIcon onClick={onEditClick} className={classes.editIcon} />
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
    {
      [options.subscribe]: true,
      [options.populateRefs]: true,
      [options.queryName]: 'asset-overview-editor'
    }
  )
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [, , userMetaResult] = useDatabaseQuery(
    CollectionNames.UserMeta,
    user ? user.id : false
  )
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
  const [isSourceUrlEditorOpen, setIsSourceUrlEditorOpen] = useState(false)
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false)
  const [isChildrenEditorOpen, setIsChildrenEditorOpen] = useState(false)
  const [isSyncWithGumroadFormOpen, setIsSyncWithGumroadFormOpen] = useState(
    false
  )
  const [isAuthorEditorOpen, setIsAuthorEditorOpen] = useState(false)
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
    [AssetFieldNames.children]: children = [],
    [AssetFieldNames.ownedBy]: ownedBy,
    [AssetFieldNames.discordServer]: discordServer,
    [AssetFieldNames.tutorialSteps]: tutorialSteps = [],
    [AssetFieldNames.pedestalVideoUrl]: pedestalVideoUrl,
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl,
    [AssetFieldNames.sketchfabEmbedUrl]: sketchfabEmbedUrl,
    [AssetFieldNames.slug]: slug
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

  const isOwnerOrEditor = canEditAsset(user, createdBy, ownedBy)
  const isAbleToEditPedestal = canEditPedestal(
    user,
    createdBy,
    ownedBy,
    userMetaResult
  )

  const EnableSpeciesEditorIcon = () => {
    return (
      <EditIcon
        onClick={() => {
          trackAction(analyticsCategoryName, 'Click edit species icon')
          setIsSpeciesEditorOpen(!isSpeciesEditorOpen)
        }}
        className={classes.editIcon}
      />
    )
  }

  if (isDeleted && !canApproveAsset(user)) {
    return <ErrorMessage>This asset has been deleted.</ErrorMessage>
  }

  const EditCategoryIcon = () => (
    <EditIcon
      onClick={() => {
        trackAction(analyticsCategoryName, 'Click edit category icon')
        setIsCategoryEditorOpen(!isCategoryEditorOpen)
      }}
      className={classes.editIcon}
    />
  )

  const AssetTitle = () => (
    <div>
      <Heading variant="h1" className={classes.title}>
        <span className={classes.titleField}>
          {isTitleEditorOpen ? (
            <AssetTitleEditor
              title={title}
              assetId={assetId}
              actionCategory={analyticsCategoryName}
              onDone={() => setIsTitleEditorOpen(false)}
            />
          ) : (
            <>
              <Link
                to={routes.viewAssetWithVar.replace(
                  ':assetId',
                  slug || assetId
                )}>
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
          )}
        </span>{' '}
        <CreatedByMessage
          author={author}
          createdBy={createdBy}
          categoryName={category}
          onEditClick={() => {
            trackAction(analyticsCategoryName, 'Click change author icon')
            setIsAuthorEditorOpen(!isAuthorEditorOpen)
          }}
        />
      </Heading>
      <div className={classes.categoryMeta}>
        {category && (
          <div>
            {species.length ? (
              <>
                <SpeciesOutput
                  speciesRefs={species}
                  speciesNames={species.map(
                    item => item[SpeciesFieldNames.singularName]
                  )}
                />
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

  const ViewSketchfabEmbedButton = () => (
    <EditorArea
      label="Embed Sketchfab"
      icon={ControlCameraIcon}
      onPencilClick={() => setIsEditingSketchfabEmbed(true)}>
      {isEditingSketchfabEmbed ? (
        <SketchfabEmbedEditor
          assetId={assetId}
          sketchfabEmbedUrl={sketchfabEmbedUrl}
          actionCategory={analyticsCategoryName}
          onDone={() => setIsEditingSketchfabEmbed(false)}
        />
      ) : sketchfabEmbedUrl ? (
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
      ) : (
        'No Sketchfab has been embedded yet'
      )}
    </EditorArea>
  )

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
        <EditorArea
          label="Description"
          icon={TextFormatIcon}
          analyticsAction="Click edit description button"
          onPencilClick={() => setIsDescriptionEditorOpen(true)}>
          {isDescriptionEditorOpen && (
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
          )}
          <Markdown source={temporaryDescription || description} />
        </EditorArea>
      </div>
    )
  }

  const PedestalChild = () => (
    <div style={{ marginLeft: '1rem ' }}>
      <AssetThumbnail />
      <AssetTitle />
      {isCategoryEditorOpen && (
        <EditorArea label="Change Category" icon={CategoryIcon}>
          <ChangeCategoryForm
            assetId={assetId}
            existingCategory={category}
            actionCategory={analyticsCategoryName}
            onDone={() => setIsCategoryEditorOpen(false)}
          />
        </EditorArea>
      )}
      {isSpeciesEditorOpen && (
        <EditorArea label="Change Species" icon={PetsIcon}>
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
        </EditorArea>
      )}
      {isAuthorEditorOpen && (
        <EditorArea label="Change Author" icon={CopyrightIcon}>
          <ChangeAuthorForm
            collectionName={CollectionNames.Assets}
            id={assetId}
            existingAuthorId={author ? author.id : null}
            existingAuthorName={author ? author[AuthorFieldNames.name] : null}
            actionCategory={analyticsCategoryName}
          />
        </EditorArea>
      )}
      <div className={classes.pedestalControls}>
        {discordServer && (
          <div className={classes.pedestalDiscordServerInfo}>
            <DiscordServerInfo discordServer={discordServer} />
          </div>
        )}
        <EditorArea
          label="Source"
          icon={LaunchIcon}
          onPencilClick={() => setIsSourceUrlEditorOpen(!isSourceUrlEditorOpen)}
          analyticsAction="Click toggle source URL editor">
          {isSourceUrlEditorOpen ? (
            <AssetSourceEditor
              assetId={assetId}
              sourceUrl={sourceUrl}
              actionCategory={analyticsCategoryName}
              onDone={() => setIsSourceUrlEditorOpen(false)}
            />
          ) : sourceUrl ? (
            <>
              <VisitSourceButton
                assetId={assetId}
                sourceUrl={sourceUrl}
                categoryName={category}
                isNoFilesAttached={downloadUrls.length === 0}
              />
            </>
          ) : (
            'You have not set a source yet!'
          )}
        </EditorArea>
        {isGumroadUrl(sourceUrl) ? (
          <EditorArea label="Gumroad">
            <div className={classes.syncGumroadForm}>
              {isSyncWithGumroadFormOpen ? (
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
                  Open Sync With Gumroad
                </Button>
              )}
            </div>
          </EditorArea>
        ) : null}
        <ViewSketchfabEmbedButton />
      </div>
      <Description />
    </div>
  )

  const AssetThumbnail = () =>
    isThumbnailEditorOpen ? (
      <EditorArea label="Upload Thumbnail" icon={ImageIcon}>
        <ThumbnailUploader
          assetId={assetId}
          analyticsCategory={analyticsCategoryName}
          onDone={() => setIsThumbnailEditorOpen(false)}
          skipDelay
        />
      </EditorArea>
    ) : (
      <div className={classes.thumbnailWrapper}>
        <EditorArea noPadding>
          <img
            src={thumbnailUrl}
            width={THUMBNAIL_WIDTH}
            height={THUMBNAIL_HEIGHT}
            alt="Thumbnail for asset"
            className={classes.thumbnail}
          />
          <EditImageIcon
            onClick={() => {
              trackAction(analyticsCategoryName, 'Click edit thumbnail icon')
              setIsThumbnailEditorOpen(true)
            }}
          />
        </EditorArea>
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
            routes.viewAssetWithVar.replace(':assetId', slug || id)
          )}
        />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:site_name" content="VRCArena" />
      </Helmet>

      {isPrivate && (
        <EditorArea label="Draft" icon={ReceiptIcon}>
          <TogglePrivateForm
            assetId={assetId}
            isPrivate={isPrivate}
            onDone={() => switchEditorOpen()}
          />
        </EditorArea>
      )}

      <EditorArea label="Upload Banner" icon={PanoramaIcon}>
        <AssetBannerEditor
          assetId={assetId}
          actionCategory={analyticsCategoryName}
          noPaper
        />
      </EditorArea>

      <PedestalColumns
        leftCol={
          <EditorArea
            onPencilClick={() => setIsEditingPedestal(!isEditingPedestal)}>
            <PedestalVideo
              videoUrl={pedestalVideoUrl || placeholderPedestalVideoUrl}
              fallbackImageUrl={
                pedestalFallbackImageUrl || placeholderPedestalFallbackImageUrl
              }
            />
          </EditorArea>
        }
        rightCol={
          isEditingPedestal ? (
            <div style={{ padding: '1rem ' }}>
              <Heading variant="h2">Edit Pedestal</Heading>
              {isAbleToEditPedestal ? (
                <PedestalUploadForm
                  assetId={assetId}
                  onDone={() => setIsEditingPedestal(false)}
                  actionCategory={analyticsCategoryName}
                />
              ) : (
                <>
                  Sorry only Patreon supporters can set a pedestal. Please
                  become a Patreon supporter going{' '}
                  <Link to={routes.patreon}>here</Link>
                </>
              )}
            </div>
          ) : (
            <PedestalChild />
          )
        }
      />

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

          <EditorArea
            label="Attach Files"
            icon={AttachFileIcon}
            onPencilClick={() => setIsAttachFileFormOpen(true)}
            analyticsAction="Click edit attachments button">
            {isAttachFileFormOpen ? (
              <>
                <AssetAttachmentUploader
                  assetId={assetId}
                  actionCategory={analyticsCategoryName}
                  onDone={() => setIsAttachFileFormOpen(false)}
                />
              </>
            ) : (
              <>
                {downloadUrls.length === 0 &&
                  videoUrls.length === 0 &&
                  imageUrls.length === 0 &&
                  'No attached files'}
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
              </>
            )}
          </EditorArea>

          {tutorialSteps.length ? (
            <>
              <Heading variant="h2">Steps</Heading>
            </>
          ) : null}

          {category === AssetCategories.tutorial && (
            <EditorArea
              label="Tutorial Steps"
              analyticsAction="Click edit tutorial steps button"
              onPencilClick={() => setIsTutorialStepsEditorOpen(true)}>
              {isTutorialStepsEditorOpen ? (
                <TutorialStepsEditor
                  assetId={assetId}
                  existingSteps={tutorialSteps}
                  onSave={() => {
                    setIsTutorialStepsEditorOpen(false)
                  }}
                  actionCategory={analyticsCategoryName}
                />
              ) : (
                <TutorialSteps steps={tutorialSteps} />
              )}
            </EditorArea>
          )}

          <EditorArea
            label="Linked Assets"
            icon={LinkIcon}
            onPencilClick={() => setIsChildrenEditorOpen(true)}
            analyticsAction="Click edit linked assets button">
            {isChildrenEditorOpen ? (
              <LinkedAssetsEditor
                assetId={assetId}
                linkedAssets={children}
                actionCategory={analyticsCategoryName}
                onDone={() => setIsChildrenEditorOpen(false)}
              />
            ) : children.length ? (
              <ChildrenAssets assetChildren={children} />
            ) : (
              'No linked assets'
            )}
          </EditorArea>

          <EditorArea
            label="Tags"
            icon={LocalOfferIcon}
            onPencilClick={() => setIsTagEditorOpen(true)}
            analyticsAction="Click edit tags button">
            <div className={classes.tags}>
              {!isTagEditorOpen ? (
                <>
                  {tags
                    ? tags.map(tagName => (
                        <TagChip key={tagName} tagName={tagName} />
                      ))
                    : 'No tags'}
                </>
              ) : (
                <AssetTagsEditor
                  assetId={assetId}
                  tags={tags}
                  onDone={() => setIsTagEditorOpen(false)}
                  actionCategory={analyticsCategoryName}
                />
              )}
            </div>
          </EditorArea>

          <EditorArea
            label="Slug"
            icon={BugReportIcon}
            editor={({ toggleEditor }) =>
              isAbleToEditPedestal ? (
                <SlugEditor
                  assetId={assetId}
                  slug={slug}
                  actionCategory={analyticsCategoryName}
                  onDone={toggleEditor}
                />
              ) : (
                <>You must be a Patreon supporter to change this</>
              )
            }
            waiting={() => (
              /* eslint-disable */
              <>
                <strong>What is a slug?</strong>
                <p>
                  A slug is the part of the URL after the first slash. Setting
                  it to something short and unique means better access for
                  search engines and it is more readable to humans.
                </p>
                <strong>Your asset slug:</strong>
                <p>
                  <span className={classes.slug}>
                    {WEBSITE_FULL_URL}
                    {slug
                      ? routes.viewAssetWithVar.replace(':assetId', slug)
                      : location.pathname.substr(
                          0,
                          location.pathname.length - 1 // prune last slash when /?edit
                        )}
                  </span>
                </p>
              </>
              /* eslint-enable */
            )}
          />
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

              <Heading variant="h4">Editor Actions</Heading>
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
