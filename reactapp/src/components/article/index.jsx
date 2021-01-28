import React from 'react'
import { Link } from 'react-router-dom'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'
import Heading from '../heading'
import FormattedDate from '../formatted-date'
import Button from '../button'
import AssetThumbnail from '../asset-thumbnail'
import * as routes from '../../routes'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    padding: '1rem',
    marginTop: '1rem'
  },
  heading: {
    fontSize: '200%',
    margin: '1.5rem 0 0.5rem 0'
  },
  description: {
    marginTop: '1.5rem'
  },
  controls: {
    marginTop: '1rem',
    textAlign: 'right'
  }
})

function trimDescription(description) {
  if (description.length >= 200) {
    return `${description.substr(0, 200)}...`
  }
  return description
}

export default ({
  article: {
    id,
    title,
    description,
    createdBy,
    createdAt,
    thumbnailUrl,
    [AssetFieldNames.slug]: slug
  }
}) => {
  const classes = useStyles()
  const readMoreUrl = routes.viewAssetWithVar.replace(':assetId', slug || id)
  return (
    <Paper className={classes.root}>
      <AssetThumbnail url={thumbnailUrl} />
      <Heading variant="h2" className={classes.heading}>
        <Link to={readMoreUrl}>{title}</Link>
      </Heading>
      Posted <FormattedDate date={createdAt} /> by{' '}
      <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
        {createdBy.username}
      </Link>
      <div className={classes.description}>
        <Markdown>{trimDescription(description)}</Markdown>
      </div>
      <div className={classes.controls}>
        <Button url={readMoreUrl}>Read More</Button>
      </div>
    </Paper>
  )
}
