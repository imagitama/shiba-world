import React, { useEffect, useState, useRef } from 'react'
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
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Image
} from 'pure-react-carousel'
import 'pure-react-carousel/dist/react-carousel.es.css'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'
import FormattedDate from '../formatted-date'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDatabaseQuery, {
  AssetFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import PedestalVideo from '../pedestal-video'
import { isUrlAnImage } from '../../utils'
import LoadingIndicator from '../loading-indicator'

const chipMargin = '0.25rem'

const useStyles = makeStyles(theme => ({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem'
    },
    overflow: 'visible'
  },
  landscape: {
    width: '100%',
    '& $media': {
      width: '200px'
    }
  },
  landscapeLink: {
    display: 'flex'
  },
  media: {
    position: 'relative', // nsfw chip
    zIndex: -1,
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
  },
  nsfwChip: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    margin: '0.25rem'
  },
  actionArea: {
    zIndex: 1
  },
  hoverOnEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: 'translate(-25%, -5%)',
    width: '300px',
    height: '300px',
    background: '#000',
    '& img': {
      height: '100%'
    },
    zIndex: 100,
    boxShadow: '1px 1px 5px #000'
    // opacity: 0
    // animation: '1s $fadeInHoverOnEffect',
    // animationFillMode: 'forwards'
  },
  pedestal: {
    width: '100%',
    '& video': {
      background: 'rgba(0,0,0,1)'
    }
  },
  slideContent: {
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 110,
    transform: 'translateY(-50%)'
  },
  slideLoadingSpinner: {
    width: '100%',
    position: 'absolute',
    top: '50%',
    left: 0,
    zIndex: 109,
    transform: 'translateY(-50%)'
  },
  carouselBtn: {
    border: 'none', // is a "button"
    borderRadius: '100%',
    background: 'rgba(0,0,0,0.5)',
    color: '#FFF',
    position: 'absolute',
    top: '50%',
    width: '30px',
    height: '30px',
    marginTop: '-15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:disabled': {
      opacity: '0'
    }
  },
  carouselNextBtn: {
    right: '10px'
  },
  carouselBackBtn: {
    left: '10px'
  },
  '@keyframes fadeInHoverOnEffect': {
    from: {
      opacity: 0
    },
    to: {
      opacity: 1
    }
  },
  slide: {
    position: 'relative'
  }
}))

function truncateTextAndAddEllipsis(text) {
  return text && text.length >= 100 ? `${text.slice(0, 100)}...` : text
}

function ExtraChips({ isApproved, isPrivate, isPinned }) {
  const classes = useStyles()
  return (
    <div className={classes.extraChips}>
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

function HoverOnContent({ asset }) {
  const classes = useStyles()

  const carouselItems = []

  if (asset[AssetFieldNames.pedestalVideoUrl]) {
    carouselItems.push(
      <div className={classes.pedestal}>
        <PedestalVideo
          videoUrl={asset[AssetFieldNames.pedestalVideoUrl]}
          fallbackImageUrl={asset[AssetFieldNames.pedestalFallbackImageUrl]}
        />
      </div>
    )
  }

  const attachedImageUrls = asset[AssetFieldNames.fileUrls].filter(isUrlAnImage)

  if (attachedImageUrls.length) {
    attachedImageUrls.forEach(url => {
      carouselItems.push(<Image src={url} alt="Attachment" />)
    })
  }

  carouselItems.push(<Image src={asset[AssetFieldNames.thumbnailUrl]} />)

  return (
    <CarouselProvider
      naturalSlideWidth={300}
      naturalSlideHeight={300}
      totalSlides={carouselItems.length}>
      <Slider>
        {carouselItems.map((item, idx) => (
          <Slide index={idx} className={classes.slide}>
            <Link
              to={routes.viewAssetWithVar.replace(
                ':assetId',
                asset[AssetFieldNames.slug] || asset.id
              )}>
              <div className={classes.slideContent}>{item}</div>
              <div className={classes.slideLoadingSpinner}>
                <LoadingIndicator />
              </div>
            </Link>
          </Slide>
        ))}
      </Slider>
      <ButtonBack
        className={`${classes.carouselBtn} ${classes.carouselBackBtn}`}>
        <ChevronLeftIcon />
      </ButtonBack>
      <ButtonNext
        className={`${classes.carouselBtn} ${classes.carouselNextBtn}`}>
        <ChevronRightIcon />
      </ButtonNext>
    </CarouselProvider>
  )
}

function HoverOnEffect({ assetId }) {
  const classes = useStyles()
  const [, , asset] = useDatabaseQuery(CollectionNames.Assets, assetId)

  return (
    <div className={classes.hoverOnEffect}>
      {asset && <HoverOnContent asset={asset} />}
    </div>
  )
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
  showCost = true,
  showIsNsfw = true,
  isLandscape = false,
  hoverOnEffect = false
}) {
  const classes = useStyles()
  const cardRef = useRef()
  const [isHoverOnEffectVisible, setIsHoverOnEffectVisible] = useState(false)

  useEffect(() => {
    if (!hoverOnEffect) {
      return
    }

    const onMouseOver = () => {
      setIsHoverOnEffectVisible(true)
    }

    const onMouseLeave = () => {
      setIsHoverOnEffectVisible(false)
    }

    cardRef.current.addEventListener('mouseover', onMouseOver)

    cardRef.current.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cardRef.current.removeEventListener('mouseover', onMouseOver)
      cardRef.current.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [hoverOnEffect])

  return (
    <Card
      className={`${classes.root} ${isLandscape ? classes.landscape : ''}`}
      ref={cardRef}>
      <CardActionArea className={classes.actionArea}>
        <Link
          to={routes.viewAssetWithVar.replace(':assetId', slug || id)}
          className={`${classes.link} ${
            isLandscape ? classes.landscapeLink : ''
          }`}>
          <ExtraChips
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
              title={`Thumbnail for ${title}`}>
              {isAdult && showIsNsfw && (
                <Chip label="NSFW" className={classes.nsfwChip} />
              )}
            </CardMedia>
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
      {isHoverOnEffectVisible && hoverOnEffect && (
        <HoverOnEffect assetId={id} />
      )}
    </Card>
  )
}
