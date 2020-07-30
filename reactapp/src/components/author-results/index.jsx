import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AuthorResultsItem from '../author-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ authors }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {authors.map(author => (
        <AuthorResultsItem key={author.id} author={author} />
      ))}
    </div>
  )
}
