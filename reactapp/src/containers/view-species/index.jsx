import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import ErrorMessage from '../../components/error-message'
import Button from '../../components/button'
import AllTagsBrowser from '../../components/all-tags-browser'
import Paper from '../../components/paper'

import { AssetCategories } from '../../hooks/useDatabaseQuery'
import useSpeciesMeta from '../../hooks/useSpeciesMeta'

import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl
} from '../../utils'
import * as routes from '../../routes'

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

export default ({
  match: {
    params: { speciesName }
  }
}) => {
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
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
