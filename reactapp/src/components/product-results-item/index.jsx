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
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import { ProductFieldNames } from '../../hooks/useDatabaseQuery'
import Price from '../price'

const useStyles = makeStyles(theme => ({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem'
    }
  },
  media: {
    position: 'relative',
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
      height: '160px'
    },
    flexShrink: 0
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary
  }
}))

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

export default ({
  product: { id, asset, [ProductFieldNames.priceUsd]: priceUsd }
}) => {
  const classes = useStyles()

  if (!asset) {
    asset = {
      thumbnailUrl: '',
      title: '...',
      description: '...'
    }
  }

  asset.thumbnailUrl =
    'https://firebasestorage.googleapis.com/v0/b/shiba-world.appspot.com/o/asset-thumbnails%2FQ7QzEH1Fy___photo_2020-09-18_19-49-29.webp?alt=media&token=c2e961f4-3ed8-43b9-b727-dccc94af680d'

  return (
    <Card className={classes.root}>
      <CardActionArea className={classes.actionArea}>
        <Link to={routes.viewProductWithVar.replace(':productId', id)}>
          <LazyLoad width={200} height={200}>
            <CardMedia
              className={classes.media}
              image={asset.thumbnailUrl}
              title={`Thumbnail for ${asset.title}`}
            />
          </LazyLoad>
          <CardContent>
            <Typography variant="h5" component="h2">
              {asset.title}
            </Typography>
            <Typography variant="h6" component="h3">
              <Price price={priceUsd} />
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {truncateTextAndAddEllipsis(asset.description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}
