import React, { useRef, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  root: {
    margin: '0 auto 1rem',
    maxWidth: '1280px',
    display: 'flex',
    [mediaQueryForTabletsOrBelow]: {
      flexDirection: 'column'
    }
  },
  col: {
    width: '50%',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  rightCol: {
    display: 'flex',
    alignItems: 'center'
  },
  video: {
    position: 'relative',
    zIndex: 100
  },
  shadow: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '25%',
    background:
      'radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 50%)'
  },
  title: {
    fontSize: '300%'
  },
  controls: {
    margin: '1rem 0'
  },
  desc: {
    fontSize: '110%'
  }
})

export default ({ videoUrl, fallbackImageUrl, children }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef()

  useEffect(() => {
    videoRef.current.addEventListener('loadeddata', () => {
      console.debug('Pedestal video has loaded -> hiding image')
      setIsVideoLoaded(true)
    })

    // fix a weird thing when it pauses randomly
    videoRef.current.addEventListener('pause', () => {
      console.debug('Pedestal video has paused -> playing')

      // on unmount this might happen
      if (videoRef.current) {
        videoRef.current.play()
      }
    })
  }, [])

  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={`${classes.col} ${classes.leftCol}`}>
        <div className={classes.shadow} />
        <video
          ref={videoRef}
          width="100%"
          controls={false}
          autoPlay={true}
          loop={true}
          muted={true}
          className={classes.video}>
          <source src={videoUrl} type="video/webm" />
        </video>
        {isVideoLoaded === false && (
          <img
            src={fallbackImageUrl}
            width="100%"
            className={classes.video}
            alt="Fallback"
          />
        )}
      </div>
      <div className={`${classes.col} ${classes.rightCol}`}>
        <div>{children}</div>
      </div>
    </div>
  )
}
