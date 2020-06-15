import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Chip from '@material-ui/core/Chip'
import LazyLoad from 'react-lazyload'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    '@media (max-width: 959px)': {
      width: '160px',
      margin: '0.25rem'
    }
  },
  media: {
    height: '200px',
    '@media (max-width: 959px)': {
      height: '160px'
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
    left: 0,
    margin: '0.5rem'
  },
  isAdultChip: {
    position: 'absolute',
    top: 0,
    right: 0,
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

const CategoryChip = ({ categoryName }) => {
  const classes = useStyles()
  return (
    <div className={classes.categoryChip}>
      <Chip label={categoryName} />
    </div>
  )
}

export default function AssetItem({
  asset: { id, title, description, thumbnailUrl, isAdult, category },
  showCategory = false
}) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
          {isAdult && <IsAdultChip />}
          {showCategory && <CategoryChip categoryName={category} />}
          <LazyLoad width={200} height={200}>
            <CardMedia
              className={classes.media}
              image={thumbnailUrl}
              title={`Thumbnail for ${title}`}
            />
          </LazyLoad>
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
