import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import twitterImageUrl from '../../assets/twitter.webp'
import youtubeImageUrl from '../../assets/youtube.webp'
import uploadImageUrl from '../../assets/upload.webp'

import { ContentTypes } from '../../../../config'

const contentTypeMeta = {
  [ContentTypes.IMAGE]: {
    title: 'Image',
    thumbnailUrl: uploadImageUrl
  },
  [ContentTypes.YOUTUBE_VIDEO]: {
    title: 'YouTube Video',
    thumbnailUrl: youtubeImageUrl
  },
  [ContentTypes.TWEET]: {
    title: 'Tweet',
    thumbnailUrl: twitterImageUrl
  }
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    width: '50%',
    padding: '0.5rem',
    position: 'relative'
  },
  contentsWrapper: {
    display: 'flex'
  },
  media: {
    width: '200px',
    height: '200px',
    flexShrink: 0
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1
  },
  // TODO: Invert theme and share components with species selector
  isSelected: {
    backgroundColor: 'grey',
    boxShadow: '0px 0px 10px #FFF'
  }
})

function Item({
  name,
  meta: { title, thumbnailUrl },
  onClick,
  isSelected = false
}) {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Card className={isSelected ? classes.isSelected : ''}>
        <CardActionArea className={classes.contentsWrapper} onClick={onClick}>
          <div className={classes.media}>
            <img
              src={thumbnailUrl}
              alt={`Thumbnail for content type ${name}`}
              className={classes.thumbnail}
            />
          </div>

          <CardContent className={classes.content}>
            <Typography variant="h5" component="h2">
              {title}
            </Typography>
            {/* <Typography component="p">{shortDescription}</Typography> */}
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  )
}

export default ({ onSelect }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {Object.entries(contentTypeMeta).map(([name, meta]) => (
        <Item key={name} meta={meta} onClick={() => onSelect(name)} />
      ))}
    </div>
  )
}
