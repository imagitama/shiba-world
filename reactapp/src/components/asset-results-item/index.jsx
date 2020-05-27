import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import * as routes from '../../routes'
import TagChip from '../tag-chip'

const useStyles = makeStyles({
  root: {
    width: 200,
    margin: '1rem',
    position: 'relative'
  },
  media: {
    height: 200
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0
  },
  primaryTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '0.5rem'
  }
})

function truncateTextAndAddEllipsis(text) {
  return text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

function getPrimaryTag(tags) {
  if (!tags) {
    return null
  }
  if (tags.length >= 2) {
    return tags[1]
  }
  return tags[0]
}

export default function AssetItem({
  asset: { id, title, description, thumbnailUrl, tags },
  showPrimaryTag = true
}) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
          <CardMedia
            className={classes.media}
            image={thumbnailUrl}
            title={`Thumbnail for ${title}`}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {truncateTextAndAddEllipsis(description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}
