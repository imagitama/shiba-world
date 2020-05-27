import React from 'react'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { Helmet } from 'react-helmet'
import useDatabase from '../../hooks/useDatabase'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import FormattedDate from '../formatted-date'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
// import VotesList from '../votes-list'
// import AddVoteForm from '../add-vote-form'
// import FeatureListButton from '../feature-list-button'
import * as routes from '../../routes'
import TagChip from '../tag-chip'
import useUserRecord from '../../hooks/useUserRecord'
import Heading from '../heading'
import Button from '../button'
import speciesMeta from '../../species-meta'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

const isUrlAnImage = url =>
  url.indexOf('png') >= 0 || url.indexOf('jpg') >= 0 || url.indexOf('jpeg') >= 0

const FileResultThumbnail = ({ url }) => {
  return (
    <img
      src={url}
      style={{ width: '100%', maxWidth: '500px' }}
      alt="Thumbnail for file"
    />
  )
}

const getFilenameFromUrl = url =>
  url
    .replace('%2F', '/')
    .split('/')
    .pop()
    .split('?')
    .shift()
    .replace(/%20/g, ' ')
    .split('___')
    .pop()

const FileResult = ({ url }) => {
  const classes = useStyles()
  return (
    <Paper style={{ padding: '1rem', marginBottom: '1rem' }}>
      {getFilenameFromUrl(url)}
      <br />
      {isUrlAnImage(url) ? (
        <FileResultThumbnail url={url} />
      ) : (
        <Button className={classes.downloadButton}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </Button>
      )}
    </Paper>
  )
}

const useStyles = makeStyles({
  description: {
    fontSize: '90%',
    margin: '1rem 0',
    '& A': { textDecoration: 'underline' }
  },
  notApprovedMessage: {
    marginBottom: '2rem',
    padding: '1rem'
  },
  downloadButton: {
    '& a': {
      color: 'inherit'
    }
  }
})

function NotApprovedMessage() {
  const classes = useStyles()
  return (
    <Paper className={classes.notApprovedMessage}>
      <strong>This asset has not been approved yet. It:</strong>
      <ul>
        <li>does not show up in search results</li>
        <li>is not visible to logged out users</li>
      </ul>
    </Paper>
  )
}

function filterOnlyNonImageUrl(url) {
  return !filterOnlyImagesUrl(url)
}

function filterOnlyImagesUrl(url) {
  return (
    url.includes('jpg') ||
    url.includes('png') ||
    url.includes('gif') ||
    url.includes('jpeg')
  )
}

function canEditAsset(currentUser, createdBy) {
  if (!currentUser) {
    return false
  }
  if (currentUser.id === createdBy.id) {
    return true
  }
  if (currentUser.isEditor) {
    return true
  }
  return false
}

function FileList({ fileUrls }) {
  if (!fileUrls.length) {
    return 'None found'
  }
  return fileUrls.map(fileUrl => <FileResult key={fileUrl} url={fileUrl} />)
}

function getDescriptionForHtmlMeta(desc) {
  let newDesc = desc
    .split('\n')
    .join(' ')
    .replace(/\s\s+/g, ' ')
  if (newDesc.length > 255) {
    return `${newDesc.substr(0, 255)}...`
  }
  return newDesc
}

function getSpeciesDisplayNameBySpeciesName(speciesName) {
  if (!speciesMeta[speciesName]) {
    throw new Error(`Unknown species name ${speciesName}`)
  }
  return speciesMeta[speciesName].name
}

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
}

export default ({ assetId, small = false }) => {
  const [isLoading, isErrored, result] = useDatabase('assets', assetId)
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
    modifiedBy
  } = result

  return (
    <>
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
          content={`https://www.vrcarena.com/assets/${id}`}
        />
        <meta property="og:image" content={thumbnailUrl} />
        <meta property="og:site_name" content="VRCArena" />
      </Helmet>
      {isApproved === false && <NotApprovedMessage />}
      <img src={thumbnailUrl} height={300} alt="The thumbnail for the asset." />
      <Heading variant="h1">
        <Link to={routes.viewAssetWithVar.replace(':assetId', assetId)}>
          {title}
        </Link>
      </Heading>
      {species && category && (
        <Heading variant="h2">
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
      <div className={classes.description}>
        <Markdown source={description} />
      </div>
      <Heading variant="h2">Files</Heading>
      <FileList
        fileUrls={fileUrls
          .filter(filterOnlyNonImageUrl)
          .filter(fileUrl => fileUrl !== thumbnailUrl)}
      />
      <Heading variant="h2">Images</Heading>
      <FileList
        fileUrls={fileUrls
          .filter(filterOnlyImagesUrl)
          .filter(fileUrl => fileUrl !== thumbnailUrl)}
      />
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
          <Link to={`/assets/${assetId}`}>
            <Button color="primary">View Asset</Button>
          </Link>
        ) : canEditAsset(user, createdBy) ? (
          <Link to={`/assets/${assetId}/edit`}>
            <Button color="primary">Edit Asset</Button>
          </Link>
        ) : null}
      </div>
      <Heading variant="h2">Comments</Heading>
      <CommentList assetId={assetId} />
      <AddCommentForm assetId={assetId} />
    </>
  )
}
