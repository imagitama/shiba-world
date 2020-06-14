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
      <strong>This asset has not been approved yet. It:</strong>
      <ul>
        <li>does not show up in search results</li>
        <li>is not visible to logged out users</li>
      </ul>
    </Paper>
  )
}
