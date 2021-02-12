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
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'

const chipMargin = '0.25rem'

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
    margin: chipMargin,
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
    margin: chipMargin,
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
  chipIcon: {
    margin: 0
  },
  chipLabel: {
    padding: 0
  },
  costChipWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: chipMargin
  },
  costChip: {
    background: '#333333' // todo: grab from theme?
  }
}))

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
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
          icon={<RoomIcon />}
          className={`${classes.extraChip} ${classes.extraChipWithIcon}`}
          classes={{
            icon: classes.chipIcon,
            label: classes.chipLabel
          }}
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

const CostChip = ({ isFree, isPaid }) => {
  const classes = useStyles()

  if (!isFree && !isPaid) {
    return null
  }

  return (
    <div className={classes.costChipWrapper}>
      <Chip
        label={isFree ? 'Free' : isPaid ? '$' : ''}
        className={classes.costChip}
      />
    </div>
  )
}

function HighlightResult({ _highlightResult }) {
  let results = []

  Object.entries(_highlightResult).forEach(([nameOfProp, valueOfProp]) => {
    let nameOfMatchingProp
    let valueOfMatchProp

    if (Array.isArray(valueOfProp)) {
      valueOfProp.forEach(subValue => {
        if (
          subValue.matchLevel !== 'none' &&
          subValue.matchedWords &&
          subValue.matchedWords.length
        ) {
          nameOfMatchingProp = nameOfProp
          valueOfMatchProp = subValue.matchedWords[0]
        }
      })
    } else {
      if (
        valueOfProp.matchLevel !== 'none' &&
        valueOfProp.matchedWords &&
        valueOfProp.matchedWords.length
      ) {
        nameOfMatchingProp = nameOfProp
        valueOfMatchProp = valueOfProp.matchedWords[0]
      }
    }

    if (nameOfMatchingProp && valueOfMatchProp) {
      results.push({
        name: nameOfMatchingProp,
        value: valueOfMatchProp
      })
    }
  })

  return results.map(result => (
    <>
      <br />
      {result.name} => {result.value}
    </>
  ))
}

const getIsFree = tags =>
  tags && (tags.includes('free') || tags.includes('free model'))
const getIsPaid = tags =>
  tags && (tags.includes('paid') || tags.includes('paid model'))

export default function AssetItem({
  asset: {
    id,
    title,
    description,
    thumbnailUrl,
    isAdult,
    isApproved = true, // handle cases when we cache the data and assume this is true
    isPrivate,
    category,
    isPinned,
    createdAt,
    tags,
    _highlightResult,
    [AssetFieldNames.slug]: slug
  },
  showCategory = false,
  showPinned = false,
  showCost = false
}) {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', slug || id)}>
          <ExtraChips
            isAdult={isAdult}
            isApproved={isApproved}
            isPrivate={isPrivate}
            isPinned={showPinned && isPinned}
          />
          {showCategory && <CategoryChip categoryName={category} />}
          {showCost && (
            <CostChip isFree={getIsFree(tags)} isPaid={getIsPaid(tags)} />
          )}
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
            {_highlightResult && (
              <HighlightResult _highlightResult={_highlightResult} />
            )}
          </CardContent>
        </Link>
      </CardActionArea>
    </Card>
  )
}
