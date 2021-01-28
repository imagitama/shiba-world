import React, { useRef, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  videoWrapper: {
    position: 'relative'
  },
  video: {
    position: 'relative',
    zIndex: 100,
    opacity: 0,
    transition: 'opacity 500ms'
  },
  loaded: {
    opacity: 1
  },
  shadowWrapper: {
    position: 'absolute',
    top: '50%',
    left: 0,
    transform: 'translateY(-25%)'
  },
  shadow: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    height: '20%',
    background:
      'radial-gradient(ellipse, rgba(0,0,0,1) 0%, rgba(255,255,255,0) 50%)'
  }
})

const INITIAL_STATES = {
  play: 'play',
  paused: 'paused'
}

export default ({
  videoUrl,
  fallbackImageUrl = '',
  preloadTime = null,
  onTimeUpdate = null,
  noShadow = false,
  initialState = INITIAL_STATES.play
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef()

  useEffect(() => {
    videoRef.current.addEventListener('loadedmetadata', () => {
      if (videoRef.current && preloadTime) {
        videoRef.current.currentTime = preloadTime
      }
    })

    videoRef.current.addEventListener('play', () => {
      console.debug('Pedestal video has loaded -> hiding image')

      if (videoRef.current) {
        setIsVideoLoaded(true)
      }

      if (videoRef.current && initialState === 'paused') {
        videoRef.current.pause()
      }
    })

    // fix a weird thing when it pauses randomly
    videoRef.current.addEventListener('pause', () => {
      // on unmount this might happen
      if (videoRef.current && initialState !== 'paused') {
        console.debug('Pedestal video has paused -> playing')
        videoRef.current.play()
      }
    })

    if (onTimeUpdate) {
      videoRef.current.addEventListener('timeupdate', e => {
        if (videoRef.current) {
          onTimeUpdate(e.target.currentTime)
        }
      })
    }
  }, [])

  const classes = useStyles()

  return (
    <div className={classes.videoWrapper}>
      {!noShadow && <div className={classes.shadow} />}
      <video
        ref={videoRef}
        width="100%"
        controls={false}
        autoPlay={initialState !== INITIAL_STATES.paused}
        loop={true}
        muted={true}
        className={`${classes.video} ${
          isVideoLoaded || initialState === INITIAL_STATES.paused
            ? classes.loaded
            : ''
        }`}>
        <source src={videoUrl} type="video/webm" />
      </video>
      {isVideoLoaded === false && fallbackImageUrl && (
        <img
          src={fallbackImageUrl}
          width="100%"
          className={classes.video}
          alt="Fallback"
        />
      )}
    </div>
  )
}
