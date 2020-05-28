import React from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import speciesMeta from '../../species-meta'
import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

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
      <Heading variant="h2">Recent Accessories</Heading>
      <p>
        Prefabs, models, textures and other accessories for your avatar. Most
        accessories should have instructions for attaching them.
      </p>
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.accessory}
      />
      <Heading variant="h2">Recent Animations</Heading>
      <p>
        Make your avatar dance, wave or run on the spot using one of these
        pre-made animations.
      </p>
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.animation}
      />
      <Heading variant="h2">Recent Tutorials</Heading>
      <p>
        Learn how to use software such as Unity, Blender or Substance Painter.
        Learn how to make changes to your avatar or build worlds.
      </p>
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.tutorial}
      />
      <Heading variant="h2">Avatar Showcase</Heading>
      <p>
        Custom avatars built using the base model for this species. Use it to
        showcase your work with photos or link to public worlds where you can
        clone the avatar.
      </p>
      <RecentAssets
        speciesName={speciesName}
        limit={5}
        categoryName={AssetCategories.avatar}
      />
    </>
  )
}
