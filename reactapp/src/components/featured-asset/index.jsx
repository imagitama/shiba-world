import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import LazyLoad from 'react-lazyload'

import * as routes from '../../routes'
import { mediaQueryForMobiles } from '../../media-queries'
import useDatabaseQuery, {
  CollectionNames,
  mapDates,
  specialCollectionIds
} from '../../hooks/useDatabaseQuery'
import { trackAction } from '../../analytics'
import Heading from '../heading'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative'
  },
  cols: {
    display: 'flex',
    [mediaQueryForMobiles]: {
      flexDirection: 'column'
    }
  },
  media: {
    width: '200px',
    height: '200px',
    [mediaQueryForMobiles]: {
      width: 'auto'
    }
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  categoryChip: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  categoryChipWithMargin: {
    margin: '0.5rem',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  extraChips: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  extraChip: {
    margin: '0.5rem',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  extraChipWithIcon: {
    width: '32px' // make rounded
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary
  },
  colRight: {
    flex: 1
  },
  heading: {
    marginTop: 0
  }
}))

const maxLength = 300

function truncateTextAndAddEllipsis(text) {
  return text.length >= maxLength ? `${text.slice(0, maxLength)}...` : text
}

export default () => {
  const [, , result] = useDatabaseQuery(
    CollectionNames.Special,
    specialCollectionIds.featuredAssets
  )
  const classes = useStyles()

  if (!result || !result.activeAsset) {
    return null
  }

  const { asset, title, description, thumbnailUrl } = mapDates(
    result.activeAsset
  )
  const id = asset.id

  return (
    <>
      <Heading variant="h2" className={classes.heading}>
        Featured Asset
      </Heading>
      <Card className={classes.root}>
        <CardActionArea>
          <Link
            to={routes.viewAssetWithVar.replace(':assetId', id)}
            onClick={() => trackAction('Home', 'Click featured asset')}
            className={classes.cols}>
            <LazyLoad width={200} height={200}>
              <CardMedia
                className={classes.media}
                image={thumbnailUrl}
                title={`Thumbnail for ${title}`}
              />
            </LazyLoad>
            <CardContent className={classes.colRight}>
              <Typography variant="h5" component="h2">
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {truncateTextAndAddEllipsis(description)}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </>
  )
}
