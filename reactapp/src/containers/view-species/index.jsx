import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import speciesMeta from '../../species-meta'
import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import { AssetCategories } from '../../hooks/useDatabaseQuery'
import categoryMeta from '../../category-meta'

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

function RecentAssetDescription({ categoryName }) {
  return <p>{categoryMeta[categoryName].shortDescription}</p>
}

const useStyles = makeStyles({
  description: {
    padding: '1rem'
  }
})

export default ({
  match: {
    params: { speciesName }
  }
}) => {
  const classes = useStyles()
  return (
    <>
      <Helmet>
        <title>
          {getNameForSpeciesName(speciesName)} |{' '}
          {getShortDescriptionForSpeciesName(speciesName)} | VRCArena
        </title>
        <meta
          name="description"
          content={getShortDescriptionForSpeciesName(speciesName)}
        />
      </Helmet>
      <Heading variant="h1">{getNameForSpeciesName(speciesName)}</Heading>
      <Paper className={classes.description}>
        <Markdown>{getDescriptionForSpeciesName(speciesName)}</Markdown>
      </Paper>
      <Heading variant="h2">Avatars</Heading>
      <RecentAssetDescription categoryName={AssetCategories.avatar} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.avatar}
      />
      <Heading variant="h2">News</Heading>
      <RecentAssetDescription categoryName={AssetCategories.article} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.article}
      />
      <Heading variant="h2">Recent Accessories</Heading>
      <RecentAssetDescription categoryName={AssetCategories.accessory} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.accessory}
      />
      <Heading variant="h2">Recent Animations</Heading>
      <RecentAssetDescription categoryName={AssetCategories.animation} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.animation}
      />
      <Heading variant="h2">Recent Tutorials</Heading>
      <RecentAssetDescription categoryName={AssetCategories.tutorial} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.tutorial}
      />
      <Heading variant="h2">Avatar Showcase</Heading>
      <RecentAssetDescription categoryName={AssetCategories.showcase} />
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.showcase}
      />
    </>
  )
}
