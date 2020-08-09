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
import RoomIcon from '@material-ui/icons/Room'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import FormattedDate from '../formatted-date'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

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
    height: '200px',
    [mediaQueryForTabletsOrBelow]: {
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
  },
  extraChipWithIcon: {
    width: '32px' // make rounded
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary
  }
}))

function truncateTextAndAddEllipsis(text) {
  return text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

function ExtraChips({ isAdult, isApproved, isPrivate, isPinned }) {
  const classes = useStyles()
  return (
    <div className={classes.extraChips}>
      {isAdult && <Chip label="NSFW" className={classes.extraChip} />}
      {!isApproved && <Chip label="Unapproved" className={classes.extraChip} />}
      {isPrivate && <Chip label="Private" className={classes.extraChip} />}
      {isPinned && (
        <Chip
          label={<RoomIcon />}
          className={`${classes.extraChip} ${classes.extraChipWithIcon}`}
        />
      )}
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
    category,
    isPinned,
    createdAt
  },
  showCategory = false,
  showPinned = false
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
            isPinned={showPinned && isPinned}
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
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            {createdAt && (
              <div className={classes.date}>
                <FormattedDate date={createdAt} />
              </div>
            )}
            <Typography variant="body2" color="textSecondary" component="p">
              {truncateTextAndAddEllipsis(description)}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}
