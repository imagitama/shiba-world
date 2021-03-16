import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useSearchTerm from '../../hooks/useSearchTerm'
import FeaturedAsset from './components/featured-asset'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrAbove,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'

const useStyles = makeStyles({
  root: {
    [mediaQueryForTabletsOrAbove]: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0
    }
  },
  featuredAsset: {
    [mediaQueryForMobiles]: {
      padding: '0.5rem'
    },
    [mediaQueryForTabletsOrAbove]: {
      width: '100%',
      maxWidth: '1000px',
      position: 'absolute',
      top: '57%',
      left: '50%',
      transform: 'translateX(-50%)'
    }
  },
  mainContent: {
    [mediaQueryForMobiles]: {
      padding: '0.5rem',
      position: 'relative',
      top: 'auto',
      transform: 'translateX(-50%)'
    },
    [mediaQueryForTabletsOrBelow]: {
      top: '20%'
    },
    width: '100%',
    maxWidth: '800px',
    position: 'absolute',
    top: '27%',
    left: '50%',
    transition: 'all 1000ms',
    transform: 'translate(-50%, -100px)'
  },
  title: {
    margin: '0 0 3rem',
    textShadow: '1px 1px 5px #000',
    textAlign: 'center',
    fontWeight: 'normal'
  }
})

export default () => {
  const classes = useStyles()
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <div className={classes.root}>
      <div className={classes.featuredAsset}>
        <FeaturedAsset />
      </div>
      <div className={classes.mainContent}>
        <h1 className={classes.title}>
          100s of avatars and accessories for the popular free-to-play
          multiplayer online VR social platform VRChat
        </h1>
      </div>
    </div>
  )
}
