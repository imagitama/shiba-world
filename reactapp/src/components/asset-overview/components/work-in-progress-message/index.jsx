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
      <strong>
        This asset is marked as a work in progress. It is incomplete and may not
        be available at this time.
      </strong>
    </Paper>
  )
}
