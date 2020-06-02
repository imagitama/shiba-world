import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    width: 200,
    margin: '0.5rem',
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
  isAdultChip: {
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '0.5rem'
  }
})

function truncateTextAndAddEllipsis(text) {
  return text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

const IsAdultChip = () => {
  const classes = useStyles()
  return (
    <div className={classes.isAdultChip}>
      <Chip label="NSFW" />
    </div>
  )
}

export default function AssetItem({
  asset: { id, title, description, thumbnailUrl, isAdult }
}) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
          {isAdult && <IsAdultChip />}
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
