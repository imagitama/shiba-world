import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import { Link } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import speciesMeta from '../../species-meta'
import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import { AssetCategories } from '../../hooks/useDatabaseQuery'
import categoryMeta from '../../category-meta'
import {
  getDescriptionForHtmlMeta,
  getOpenGraphUrlForRouteUrl
} from '../../utils'
import * as routes from '../../routes'

function getSpeciesByName(speciesName) {
  if (!speciesMeta[speciesName]) {
    throw new Error(`Invalid species name: ${speciesName}`)
  }
  return speciesMeta[speciesName]
}

function getNameForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).name
}

function getShortDescriptionForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).shortDescription
}

function getDescriptionForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).description
}

function getBackupThumbnailUrlForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).backupThumbnailUrl
}

function RecentAssetDescription({ categoryName }) {
  return <p>{categoryMeta[categoryName].shortDescription}</p>
}

const useStyles = makeStyles({
  description: {
    padding: '1rem',
    '& p:first-child': {
      marginTop: 0
    },
    '& p:last-child': {
      marginBottom: 0
    }
  }
})

export default ({
  match: {
    params: { speciesName }
  }
}) => {
  const classes = useStyles()
  const description = getShortDescriptionForSpeciesName(speciesName)
  const titleWithoutSuffix = `${getNameForSpeciesName(
    speciesName
  )} | ${description}`
  return (
    <>
      <Helmet>
        <title>{titleWithoutSuffix} | VRCArena</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={titleWithoutSuffix} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={getDescriptionForHtmlMeta(description)}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewSpeciesWithVar.replace(':speciesName', speciesName)
          )}
        />
        <meta
          property="og:image"
          content={getOpenGraphUrlForRouteUrl(
            getBackupThumbnailUrlForSpeciesName(speciesName)
          )}
        />
      </Helmet>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(':speciesName', speciesName)}>
          {getNameForSpeciesName(speciesName)}
        </Link>
      </Heading>
      <Paper className={classes.description}>
        <Markdown>{getDescriptionForSpeciesName(speciesName)}</Markdown>
      </Paper>
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', AssetCategories.avatar)}>
          Avatars
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.avatar} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.avatar}
      />
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', AssetCategories.article)}>
          News
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.article} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.article}
      />
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', AssetCategories.accessory)}>
          Recent Accessories
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.accessory} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.accessory}
      />
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', AssetCategories.animation)}>
          Recent Animations
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.animation} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.animation}
      />
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', AssetCategories.tutorial)}>
          Recent Tutorials
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.tutorial} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.tutorial}
      />
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', AssetCategories.showcase)}>
          Avatar Showcase
        </Link>
      </Heading>
      <RecentAssetDescription categoryName={AssetCategories.showcase} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.showcase}
      />
    </>
  )
}
