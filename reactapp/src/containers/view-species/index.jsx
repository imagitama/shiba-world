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
  SpeciesFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
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

const otherSpeciesSlug = 'other-species'

function isRouteVarAFirebaseId(routeVar) {
  return (
    routeVar &&
    routeVar.length >= 20 &&
    routeVar.match(/^[a-z0-9]+$/i) !== null &&
    !routeVar.includes(' ')
  )
}

const analyticsCategory = 'ViewSpecies'

const SpeciesResult = ({ speciesIdOrSlug }) => {
  const isFirebaseId = isRouteVarAFirebaseId(speciesIdOrSlug)
  const [, , user] = useUserRecord()
  let [isLoading, isError, species] = useDatabaseQuery(
    CollectionNames.Species,
    isFirebaseId
      ? speciesIdOrSlug
      : [[SpeciesFieldNames.slug, Operators.EQUALS, speciesIdOrSlug]]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  if (!species || (!isFirebaseId && !species.length)) {
    return <ErrorMessage>Could not found that species</ErrorMessage>
  }

  species = Array.isArray(species) ? species[0] : species

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
            routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', species.id)
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
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            species.id
          )}>
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
            url={routes.editSpeciesWithVar.replace(':speciesId', species.id)}
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
        speciesId={species.id}
        limit={999}
        categoryName={AssetCategories.avatar}
        showPinned
        title="Avatars"
      />
      <RecentAssets
        speciesId={species.id}
        limit={5}
        categoryName={AssetCategories.article}
        title="News"
      />
      <RecentAssets
        speciesId={species.id}
        limit={5}
        categoryName={AssetCategories.accessory}
        title="Recent Accessories"
      />
      <RecentAssets
        speciesId={species.id}
        limit={5}
        categoryName={AssetCategories.animation}
        title="Recent Animations"
      />
      <RecentAssets
        speciesId={species.id}
        limit={5}
        categoryName={AssetCategories.tutorial}
        title="Recent Tutorials"
      />
      <RecentAssets
        speciesId={species.id}
        limit={5}
        categoryName={AssetCategories.world}
        title="Recent Worlds"
      />
      <RecentAssets
        speciesId={species.id}
        limit={5}
        categoryName={AssetCategories.alteration}
        title="Recent Alterations"
      />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}

function OtherSpecies() {
  const classes = useStyles()

  const species = {
    [SpeciesFieldNames.pluralName]: 'Other Species',
    [SpeciesFieldNames.description]: 'Assets that do not have a species.',
    [SpeciesFieldNames.shortDescription]: 'Assets that do not have a species.'
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
            routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', species.id)
          )}
        />
        <meta
          property="og:image"
          content={species[SpeciesFieldNames.thumbnailUrl]}
        />
      </Helmet>
      {/* <div className={classes.thumbnailWrapper}>
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
      </div> */}
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            otherSpeciesSlug
          )}>
          {species[SpeciesFieldNames.pluralName]}
        </Link>
      </Heading>
      <Paper>
        <Markdown className={classes.description}>
          {species[SpeciesFieldNames.description]}
        </Markdown>
      </Paper>
      <RecentAssets
        speciesId={false}
        limit={999}
        categoryName={AssetCategories.avatar}
        showPinned
        title="Avatars"
      />
      <RecentAssets
        speciesId={false}
        limit={5}
        categoryName={AssetCategories.article}
        title="News"
      />
      <RecentAssets
        speciesId={false}
        limit={5}
        categoryName={AssetCategories.accessory}
        title="Recent Accessories"
      />
      <RecentAssets
        speciesId={false}
        limit={5}
        categoryName={AssetCategories.animation}
        title="Recent Animations"
      />
      <RecentAssets
        speciesId={false}
        limit={5}
        categoryName={AssetCategories.tutorial}
        title="Recent Tutorials"
      />
      <RecentAssets
        speciesId={false}
        limit={5}
        categoryName={AssetCategories.world}
        title="Recent Worlds"
      />
      <RecentAssets
        speciesId={false}
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
    params: { speciesIdOrSlug }
  }
}) =>
  speciesIdOrSlug === otherSpeciesSlug ? (
    <OtherSpecies />
  ) : (
    <SpeciesResult speciesIdOrSlug={speciesIdOrSlug} />
  )
