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
import {
  mediaQueryForTabletsOrBelow,
  mediaQueryForMobiles
} from '../../media-queries'
import useDatabaseQuery, { mapDates } from '../../hooks/useDatabaseQuery'
import Heading from '../heading'

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: '2rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {}
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

// const CategoryChip = ({ categoryName }) => {
//   const classes = useStyles()
//   return (
//     <div className={classes.categoryChip}>
//       <Chip
//         label={categoryMeta[categoryName].nameSingular}
//         className={classes.categoryChipWithMargin}
//       />
//     </div>
//   )
// }

export default () => {
  const [, , result] = useDatabaseQuery('special', 'featured')
  const classes = useStyles()

  if (!result) {
    return null
  }

  const {
    id,
    title,
    description,
    thumbnailUrl,
    isAdult,
    isApproved,
    isPrivate,
    // category,
    // isPinned,
    createdAt
  } = mapDates(result.asset)

  return (
    <>
      <Heading variant="h2" className={classes.heading}>
        Featured Asset
      </Heading>
      <Card className={classes.root}>
        <CardActionArea>
          <Link
            to={routes.viewAssetWithVar.replace(':assetId', id)}
            className={classes.cols}>
            <ExtraChips
              isAdult={isAdult}
              isApproved={isApproved}
              isPrivate={isPrivate}
              // isPinned={showPinned && isPinned}
            />
            {/* {showCategory && <CategoryChip categoryName={category} />} */}
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
    </>
  )
}
