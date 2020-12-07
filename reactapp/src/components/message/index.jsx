import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    margin: '1rem 0',
    padding: '1rem',
    textAlign: 'center'
  }
}))

export const types = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
}

export const styles = {
  DEFAULT: 'default',
  BG: 'bg'
}

export default ({ children, type = types.INFO, style = styles.DEFAULT }) => {
  const classes = useStyles()

  if (style === styles.BG) {
    return <div className={classes.root}>{children}</div>
  } else {
    return <Paper className={classes.root}>{children}</Paper>
  }
}
