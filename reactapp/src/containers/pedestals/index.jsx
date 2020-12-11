import React, { useRef, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  pedestals: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  pedestal: {
    width: '300px',
    height: '300px',
    position: 'relative'
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
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
  image: {
    position: 'absolute',
    top: 0,
    left: 0
  }
})

function Pedestal({ videoUrl, fallbackImageUrl }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef()
  const pedestalRef = useRef()
  const classes = useStyles()

  useEffect(() => {
    videoRef.current.addEventListener('loadeddata', () => {
      setIsVideoLoaded(true)
    })

    videoRef.current.addEventListener('mouseover', () => {
      videoRef.current.play()
    })

    videoRef.current.addEventListener('mouseout', () => {
      videoRef.current.pause()
    })
  }, [])

  return (
    <div className={classes.pedestal} ref={pedestalRef}>
      <div className={classes.shadow} />
      <video
        ref={videoRef}
        width="100%"
        controls={false}
        autoPlay={false}
        loop={true}
        muted={true}
        className={`${classes.video} ${isVideoLoaded ? classes.playing : ''}`}>
        <source src={videoUrl} type="video/webm" />
      </video>
      {!isVideoLoaded && (
        <img
          src={fallbackImageUrl}
          width="100%"
          className={`${classes.image} ${isVideoLoaded ? classes.playing : ''}`}
          alt="Fallback"
        />
      )}
    </div>
  )
}

function Pedestals({ pedestals }) {
  const classes = useStyles()

  return (
    <div className={classes.pedestals}>
      {pedestals.map(pedestal => (
        <Pedestal
          key={pedestal[AssetFieldNames.pedestalVideoUrl]}
          videoUrl={pedestal[AssetFieldNames.pedestalVideoUrl]}
          fallbackImageUrl={pedestal[AssetFieldNames.pedestalFallbackImageUrl]}
        />
      ))}
    </div>
  )
}

function Assets() {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load assets</ErrorMessage>
  }

  const resultsWithPedestals = results.filter(
    asset => asset[AssetFieldNames.pedestalVideoUrl]
  )

  return (
    <Pedestals
      pedestals={resultsWithPedestals.map(asset => ({
        [AssetFieldNames.pedestalVideoUrl]:
          asset[AssetFieldNames.pedestalVideoUrl],
        [AssetFieldNames.pedestalFallbackImageUrl]:
          asset[AssetFieldNames.pedestalFallbackImageUrl]
      }))}
    />
  )
}

export default () => {
  const classes = useStyles()

  return (
    <>
      <Helmet>
        <title>Pedestals | VRCArena</title>
        <meta name="description" content="View the pedestals." />
      </Helmet>

      <div className={classes.root}>
        <Heading variant="h1">Pedestals</Heading>
        <Assets />
      </div>
    </>
  )
}
