import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'

import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import AllTagsBrowser from '../../components/all-tags-browser'
import Paper from '../../components/paper'

import useDatabaseQuery, {
  AssetCategories,
  CollectionNames,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import useSpeciesMeta from '../../hooks/useSpeciesMeta'
import useUserRecord from '../../hooks/useUserRecord'

import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl,
  canEditSpecies
} from '../../utils'
import * as routes from '../../routes'
import LoadingIndicator from '../../components/loading-indicator'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  description: {
    '& *:first-child': {
      marginTop: 0
    },
    '& *:last-child': {
      marginBottom: 0
    }
  },
  thumbnailWrapper: {
    width: '200px',
    height: '200px',
    '& img': {
      width: '100%',
      height: '100%'
    }
  }
})

function isRouteVarAFirebaseId(routeVar) {
  return (
    routeVar &&
    routeVar.length >= 20 &&
    routeVar.match(/^[a-z0-9]+$/i) !== null &&
    !routeVar.includes(' ')
  )
}

const OldSpeciesResult = ({ speciesName }) => {
  const species = useSpeciesMeta(speciesName)
  const classes = useStyles()

  if (!species) {
    return (
      <ErrorMessage>
        Sorry that species does not seem to exist.
        <br />
        <br />
        <Button url={routes.viewAllSpecies}>View All Species</Button>
      </ErrorMessage>
    )
  }

  const titleWithoutSuffix = `${species.name} | ${species.shortDescription}`

  return (
    <>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta name="description" content={species.shortDescription} />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(species.shortDescription)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewSpeciesWithVar.replace(':speciesName', speciesName)
          )}
        />
        <meta
          property="og:image"
          content={getOpenGraphUrlForRouteUrl(species.backupThumbnailUrl)}
        />
      </Helmet>
      <div className={classes.thumbnailWrapper}>
        <a
          href={species.thumbnailSourceUrl}
          title={`Visit the source of the thumbnail for ${species.name}`}
          target="_blank"
          rel="noopener noreferrer">
          <picture>
            <source srcSet={species.optimizedThumbnailUrl} type="image/webp" />
            <source srcSet={species.backupThumbnailUrl} type="image/png" />
            <img
              src={species.backupThumbnailUrl}
              alt={`Thumbnail for species ${species.name}`}
              className={classes.thumbnail}
            />
          </picture>
        </a>
      </div>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(':speciesName', speciesName)}>
          {species.name}
        </Link>
      </Heading>
      <Paper>
        <Markdown className={classes.description}>
          {species.description}
        </Markdown>
      </Paper>
      <RecentAssets
        speciesName={speciesName}
        limit={999}
        categoryName={AssetCategories.avatar}
        showPinned
        title="Avatars"
      />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.article}
        title="News"
      />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.accessory}
        title="Recent Accessories"
      />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.animation}
        title="Recent Animations"
      />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.tutorial}
        title="Recent Tutorials"
      />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.world}
        title="Recent Worlds"
      />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.alteration}
        title="Recent Alterations"
      />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}

const analyticsCategory = 'ViewSpecies'

const NewSpeciesResult = ({ speciesId }) => {
  const [, , user] = useUserRecord()
  const [isLoading, isError, species] = useDatabaseQuery(
    CollectionNames.Species,
    speciesId
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  const titleWithoutSuffix = `${species[SpeciesFieldNames.pluralName]} | ${
    species[SpeciesFieldNames.shortDescription]
  }`

  return (
    <>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta
          name="description"
          content={species[SpeciesFieldNames.shortDescription]}
        />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(
            species[SpeciesFieldNames.shortDescription]
          )}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewSpeciesWithVar.replace(
              ':speciesName',
              species[SpeciesFieldNames.id]
            )
          )}
        />
        <meta
          property="og:image"
          content={species[SpeciesFieldNames.thumbnailUrl]}
        />
      </Helmet>
      <div className={classes.thumbnailWrapper}>
        <a
          href={species[SpeciesFieldNames.thumbnailSourceUrl]}
          title={`Visit the source of the thumbnail for ${
            species[SpeciesFieldNames.pluralName]
          }`}
          target="_blank"
          rel="noopener noreferrer">
          <picture>
            <source
              srcSet={species[SpeciesFieldNames.thumbnailUrl]}
              type="image/webp"
            />
            <source
              srcSet={species[SpeciesFieldNames.fallbackThumbnailUrl]}
              type="image/png"
            />
            <img
              src={species[SpeciesFieldNames.fallbackThumbnailUrl]}
              alt={`Thumbnail for species ${
                species[SpeciesFieldNames.pluralName]
              }`}
              className={classes.thumbnail}
            />
          </picture>
        </a>
      </div>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(':speciesName', species.id)}>
          {species[SpeciesFieldNames.pluralName]}
        </Link>
      </Heading>
      <Paper>
        <Markdown className={classes.description}>
          {species[SpeciesFieldNames.description]}
        </Markdown>
      </Paper>
      {canEditSpecies(user) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.editSpeciesWithVar.replace(':speciesName', species.id)}
            icon={<EditIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click edit species button',
                species.id
              )
            }>
            Edit
          </Button>
        </>
      )}
      <RecentAssets
        speciesId={speciesId}
        limit={999}
        categoryName={AssetCategories.avatar}
        showPinned
        title="Avatars"
      />
      <RecentAssets
        speciesId={speciesId}
        limit={5}
        categoryName={AssetCategories.article}
        title="News"
      />
      <RecentAssets
        speciesId={speciesId}
        limit={5}
        categoryName={AssetCategories.accessory}
        title="Recent Accessories"
      />
      <RecentAssets
        speciesId={speciesId}
        limit={5}
        categoryName={AssetCategories.animation}
        title="Recent Animations"
      />
      <RecentAssets
        speciesId={speciesId}
        limit={5}
        categoryName={AssetCategories.tutorial}
        title="Recent Tutorials"
      />
      <RecentAssets
        speciesId={speciesId}
        limit={5}
        categoryName={AssetCategories.world}
        title="Recent Worlds"
      />
      <RecentAssets
        speciesId={speciesId}
        limit={5}
        categoryName={AssetCategories.alteration}
        title="Recent Alterations"
      />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}

export default ({
  match: {
    params: { speciesName }
  }
}) => {
  return isRouteVarAFirebaseId(speciesName) ? (
    <NewSpeciesResult speciesId={speciesName} />
  ) : (
    <OldSpeciesResult speciesName={speciesName} />
  )
}
