import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'

import Heading from '../heading'
import Button from '../button'
import FormattedDate from '../formatted-date'

import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    marginBottom: '1rem',
    padding: '1rem'
  },
  cols: {
    display: 'flex'
  },
  leftCol: {
    flexShrink: 0,
    marginRight: '1rem'
  },
  rightCol: {
    flex: 1,
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    right: 0
  },
  heading: {
    marginTop: 0,
    fontSize: '175%'
  },
  thumbnail: {
    width: '200px',
    height: '200px'
  }
})

export default ({
  url,
  title,
  description,
  author,
  date,
  thumbnailUrl = ''
}) => {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <div className={classes.cols}>
        {thumbnailUrl && (
          <div className={classes.leftCol}>
            <img
              src={thumbnailUrl}
              alt={`Thumbnail for ${title}`}
              className={classes.thumbnail}
            />
          </div>
        )}
        <div className={classes.rightCol}>
          <div>
            <Heading variant="h3" className={classes.heading}>
              <Link to={url}>{title}</Link>
            </Heading>
            Posted by{' '}
            <Link to={routes.viewUserWithVar.replace(':userId', author.id)}>
              {author.username}
            </Link>{' '}
            <FormattedDate date={date} />
          </div>
          <Markdown source={description} />
          <div className={classes.controls}>
            <Button url={url}>Read More</Button>
          </div>
        </div>
      </div>
    </Paper>
  )
}
