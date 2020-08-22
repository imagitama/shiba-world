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
      <strong>This asset has been deleted. It:</strong>
      <ul>
        <li>does not show up in any results anywhere</li>
        <li>is only accessible by direct link</li>
      </ul>
    </Paper>
  )
}
