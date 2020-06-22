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
import categoryMeta from '../../category-meta'

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
  }
})

function truncateTextAndAddEllipsis(text) {
  return text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

function ExtraChips({ isAdult, isApproved, isPrivate }) {
  const classes = useStyles()
  return (
    <div className={classes.extraChips}>
      {isAdult && <Chip label="NSFW" className={classes.extraChip} />}
      {!isApproved && <Chip label="Unapproved" className={classes.extraChip} />}
      {isPrivate && <Chip label="Private" className={classes.extraChip} />}
    </div>
  )
}

const CategoryChip = ({ categoryName }) => {
  const classes = useStyles()
  return (
    <div className={classes.categoryChip}>
      <Chip
        label={categoryMeta[categoryName].nameSingular}
        className={classes.categoryChipWithMargin}
      />
    </div>
  )
}

export default function AssetItem({
  asset: {
    id,
    title,
    description,
    thumbnailUrl,
    isAdult,
    isApproved,
    isPrivate,
    category
  },
  showCategory = false
}) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
          <ExtraChips
            isAdult={isAdult}
            isApproved={isApproved}
            isPrivate={isPrivate}
          />
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
