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
import LoadingIndicator from '../../../../components/loading-indicator'
import * as routes from '../../../../routes'
import { trackAction } from '../../../../analytics'
import { trimDescription } from '../../../../utils/formatting'

const useStyles = makeStyles({
  thumbnailWrapper: {
    perspective: '1000px',
    textAlign: 'center',
    padding: '1rem 0'
  },
  thumbnail: {
    animation: '20s $spinThumbnail infinite linear',
    transition: 'all 100ms',
    '&:hover': {
      animation: 'none'
    }
  },
  controls: {
    textAlign: 'center',
    marginTop: '1rem'
  },
  heading: {
    textAlign: 'center',
    margin: '1rem 0'
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

export default () => {
  const [, , result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.featuredAssets
  )
  const classes = useStyles()

  if (!result || !result.activeAsset) {
    return (
      <div className={classes.featuredAsset}>
        <LoadingIndicator />
      </div>
    )
  }

  const {
    title,
    description,
    thumbnailUrl,
    [AssetFieldNames.pedestalVideoUrl]: pedestalVideoUrl,
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl
  } = result.activeAsset
  const id = result.activeAsset.asset.id
  const viewUrl = routes.viewAssetWithVar.replace(':assetId', id)

  return (
    <div className={classes.featuredAsset}>
      <div>
        <Link
          to={viewUrl}
          onClick={() => trackAction('Home', 'Click featured asset thumbnail')}>
          {pedestalVideoUrl ? (
            <PedestalVideo
              videoUrl={pedestalVideoUrl}
              fallbackImageUrl={pedestalFallbackImageUrl}
            />
          ) : (
            <div className={classes.thumbnailWrapper}>
              <img
                src={thumbnailUrl}
                className={classes.thumbnail}
                alt="Pedestal fallback"
              />
            </div>
          )}
        </Link>
      </div>
      <div>
        <Heading variant="h1" className={classes.heading}>
          <Link
            to={viewUrl}
            onClick={() => trackAction('Home', 'Click featured asset title')}>
            {title}
          </Link>
        </Heading>
        <Heading variant="h2" className={classes.heading}>
          Featured Asset
        </Heading>
        {trimDescription(description)}
        <div className={classes.controls}>
          <Button
            url={viewUrl}
            size="large"
            icon={<ChevronRightIcon />}
            onClick={() =>
              trackAction('Home', 'Click view featured asset button')
            }>
            View Asset
          </Button>
        </div>
      </div>
    </div>
  )
}
