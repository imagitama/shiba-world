import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import useDatabaseQuery, {
  CollectionNames,
  specialCollectionIds,
  AssetFieldNames
} from '../../../../hooks/useDatabaseQuery'
import Heading from '../../../../components/heading'
import Button from '../../../../components/button'
import PedestalVideo from '../../../../components/pedestal-video'
import * as routes from '../../../../routes'
import { trackAction } from '../../../../analytics'
import { trimDescription } from '../../../../utils/formatting'
import { mediaQueryForMobiles } from '../../../../media-queries'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.1)',
    // padding: '2rem',
    borderRadius: '0.5rem',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
      padding: '1rem'
    },
    position: 'relative',
    margin: '2rem 2rem 4rem'
  },
  thumbnailWrapper: {
    perspective: '1000px',
    textAlign: 'center',
    padding: '1rem 0',
    height: '100%'
  },
  thumbnailImage: {
    height: '100%',
    animation: '20s $spinThumbnail infinite linear',
    transition: 'all 100ms',
    '&:hover': {
      animation: 'none'
    }
  },
  controls: {
    textAlign: 'center',
    marginTop: '2rem',
    [mediaQueryForMobiles]: {
      marginTop: '1rem'
    }
  },
  heading: {
    margin: '0 0 1rem',
    fontSize: '175%'
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  '@keyframes spinThumbnail': {
    from: {
      transform: 'rotateY(0deg)'
    },
    to: {
      transform: 'rotateY(360deg)'
    }
  },
  media: {
    width: '12%',
    marginRight: '1rem',
    [mediaQueryForMobiles]: {
      marginRight: 0,
      width: '50%'
    }
  },
  video: {
    display: 'flex',
    transform: 'scale(1.9)',
    transition: 'all 100ms',
    [mediaQueryForMobiles]: {
      transform: 'scale(1)'
    }
  },
  text: {
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  newIndicator: {
    backgroundColor: 'rgb(255, 0, 0)',
    color: '#FFF',
    borderRadius: '1rem',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '0.25rem 1rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    transform: 'translate(-50%, -50%)',
    cursor: 'default',
    fontSize: '150%'
  }
})

export default () => {
  const [, , result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.featuredAssets
  )
  const classes = useStyles()

  if (!result || !result.overrideAsset) {
    return null
  }

  const {
    title,
    description,
    [AssetFieldNames.shortDescription]: shortDescription,
    thumbnailUrl,
    [AssetFieldNames.pedestalVideoUrl]: pedestalVideoUrl,
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl
  } = result.overrideAsset
  const id = result.overrideAsset.asset.id
  const viewUrl = routes.viewAssetWithVar.replace(':assetId', id)

  return (
    <div className={classes.root}>
      {result.overrideAsset && <div className={classes.newIndicator}>New</div>}
      <div className={classes.media}>
        <Link
          to={viewUrl}
          onClick={() =>
            trackAction('AssetsList', 'Click featured asset thumbnail')
          }>
          {pedestalVideoUrl ? (
            <div className={classes.video}>
              <PedestalVideo
                videoUrl={pedestalVideoUrl}
                fallbackImageUrl={pedestalFallbackImageUrl}
                noShadow
              />
            </div>
          ) : (
            <div className={classes.thumbnailWrapper}>
              <img
                src={thumbnailUrl}
                className={classes.thumbnailImage}
                alt="Pedestal fallback"
              />
            </div>
          )}
        </Link>
      </div>
      <div className={classes.text}>
        <Heading variant="h1" className={classes.heading}>
          <Link
            to={viewUrl}
            onClick={() =>
              trackAction('AssetsList', 'Click featured asset title')
            }>
            {title}
          </Link>
        </Heading>
        {trimDescription(shortDescription || description || '')}
        <div className={classes.controls}>
          <Button
            url={viewUrl}
            size="large"
            icon={<ChevronRightIcon />}
            onClick={() =>
              trackAction('AssetsList', 'Click view featured asset button')
            }>
            View Avatar
          </Button>
        </div>
      </div>
    </div>
  )
}
