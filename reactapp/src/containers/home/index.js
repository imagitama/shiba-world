import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import SpeciesBrowser from '../../components/species-browser'
import AllTagsBrowser from '../../components/all-tags-browser'
import Paper from '../../components/paper'
import Polls from '../../components/polls'
import FeaturedAsset from '../../components/featured-asset'
import NewsFrontPage from '../../components/news-front-page'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'
import { trackAction } from '../../analytics'

import useSearchTerm from '../../hooks/useSearchTerm'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

import accessoryTileBgOptimized from './assets/tiles/accessory_optimized.webp'
import avatarTileBgOptimized from './assets/tiles/avatar_optimized.webp'
import tutorialTileBgOptimized from './assets/tiles/tutorial_optimized.webp'
import worldTileBgOptimized from './assets/tiles/world_optimized.webp'
import animationTileBgOptimized from './assets/tiles/animation_optimized.webp'

const useStyles = makeStyles({
  polls: {
    marginTop: '1rem'
  },
  tiles: {
    display: 'flex',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
      flexDirection: 'column'
    }
  },
  tile: {
    position: 'relative',
    flex: 1,
    width: '100%',
    minHeight: '10rem',
    backgroundSize: 'cover',
    padding: 0,
    [mediaQueryForMobiles]: {
      marginBottom: '0.5rem'
    }
  },
  [AssetCategories.accessory]: {
    backgroundImage: `url(${accessoryTileBgOptimized})`
  },
  [AssetCategories.avatar]: {
    backgroundImage: `url(${avatarTileBgOptimized})`
  },
  [AssetCategories.tutorial]: {
    backgroundImage: `url(${tutorialTileBgOptimized})`
  },
  [AssetCategories.world]: {
    backgroundImage: `url(${worldTileBgOptimized})`
  },
  [AssetCategories.animation]: {
    backgroundImage: `url(${animationTileBgOptimized})`
  },
  center: {
    margin: '0 1rem',
    [mediaQueryForMobiles]: {
      margin: '0 0 0.5rem'
    }
  },
  primary: {
    marginBottom: '1rem',
    [mediaQueryForMobiles]: {
      marginBottom: 0
    },
    '& $tile': {
      minHeight: '20rem',
      [mediaQueryForMobiles]: {
        minHeight: '10rem'
      }
    }
  },
  secondary: {
    '& $tile:last-child': {
      marginLeft: '1rem',
      [mediaQueryForMobiles]: {
        margin: '0 0 1rem'
      }
    }
  },
  link: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    padding: '1rem',
    color: '#FFF', // come from theme?
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    '& > div': {
      width: '100%'
    }
  },
  title: {
    fontSize: '200%',
    display: 'block',
    width: '100%',
    textAlign: 'center',
    [mediaQueryForMobiles]: {
      fontSize: '150%'
    }
  },
  subtitle: {
    marginTop: '0.5rem',
    fontSize: '100%',
    display: 'block',
    width: '100%',
    textAlign: 'center'
  },
  featuredAsset: {
    margin: '2rem 0 1rem'
  },
  cols: {
    display: 'flex',
    [mediaQueryForTabletsOrBelow]: {
      display: 'block'
    }
  },
  col: {
    width: '50%',
    '&:first-child': {
      paddingRight: '1rem'
    },
    '&:last-child': {
      paddingLeft: '1rem'
    },
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      padding: 0
    }
  }
})

function Tile({ id, title, subtitle, url, className = '' }) {
  const classes = useStyles()
  return (
    <Paper className={`${classes.tile} ${classes[id]} ${className}`} hover>
      <Link
        to={url}
        className={classes.link}
        onClick={() => trackAction('Home', 'Click on tile', id)}>
        <div>
          <span className={classes.title}>{title}</span>
          <span className={classes.subtitle}>{subtitle}</span>
        </div>
      </Link>
    </Paper>
  )
}

function Tiles() {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={`${classes.tiles} ${classes.primary}`}>
        <Tile
          id={AssetCategories.avatar}
          title="Find avatars"
          subtitle={categoryMeta[AssetCategories.avatar].shortDescription}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.avatar
          )}
        />
        <Tile
          id={AssetCategories.accessory}
          title="Find accessories"
          subtitle={categoryMeta[AssetCategories.accessory].shortDescription}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.accessory
          )}
          className={classes.center}
        />
        <Tile
          id={AssetCategories.tutorial}
          title="Find tutorials"
          subtitle={categoryMeta[AssetCategories.tutorial].shortDescription}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.tutorial
          )}
        />
      </div>
      <div className={`${classes.tiles}  ${classes.secondary}`}>
        <Tile
          id={AssetCategories.world}
          title="Find worlds"
          subtitle={categoryMeta[AssetCategories.world].shortDescription}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.world
          )}
        />
        <Tile
          id={AssetCategories.animation}
          title="Find animations"
          subtitle={categoryMeta[AssetCategories.animation].shortDescription}
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            AssetCategories.animation
          )}
        />
      </div>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Tiles />

      <div className={classes.cols}>
        <div className={classes.col}>
          <div className={classes.featuredAsset}>
            <FeaturedAsset />
          </div>

          <Heading variant="h2">Poll</Heading>
          <Polls className={classes.polls} />

          <Heading variant="h2">News</Heading>
          <NewsFrontPage />
        </div>

        <div className={classes.col}>
          <SpeciesBrowser
            onSpeciesClick={speciesName =>
              trackAction('Home', 'Click species browser', speciesName)
            }
          />
        </div>
      </div>

      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
