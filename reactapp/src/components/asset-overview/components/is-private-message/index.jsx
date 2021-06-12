import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

const useStyles = makeStyles({
  root: {
    marginBottom: '2rem',
    padding: '1rem'
  }
})

export default () => {
  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <strong>This asset is private. It:</strong>
      <ul>
        <li>does not show up in search results</li>
        <li>does not show up in any results for a category or species</li>
        <li>
          is only listed under your account overview (which is only visible to
          the uploader)
        </li>
      </ul>
      <strong>
        You must click the Edit button and click Publish so that a staff member
        can review it
      </strong>
    </Paper>
  )
}
