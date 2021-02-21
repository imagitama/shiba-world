import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'

const useStyles = makeStyles({
  root: {
    perspective: '1000px'
  },
  spin: {
    animation: '20s $spinThumbnail infinite linear',
    transition: 'all 100ms'
  },
  pauseOnHover: {
    '&:hover': {
      animation: 'none'
    }
  },
  '@keyframes spinThumbnail': {
    from: {
      transform: 'rotateY(0deg)'
    },
    to: {
      transform: 'rotateY(360deg)'
    }
  }
})

export default ({ url, className = '', spin = false, pauseOnHover = true }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <img
        src={url}
        width={THUMBNAIL_WIDTH}
        height={THUMBNAIL_HEIGHT}
        alt="Thumbnail for asset"
        className={`${className} ${spin ? classes.spin : ''} ${
          pauseOnHover ? classes.pauseOnHover : ''
        }`}
      />
    </div>
  )
}
