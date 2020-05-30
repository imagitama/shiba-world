import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(() => ({
  progress: {
    display: 'block',
    margin: '0 auto'
  },
  message: {
    marginTop: '1rem',
    textAlign: 'center'
  }
}))

function LoadingIndicator({ message = '' }) {
  const classes = useStyles()
  return (
    <>
      <CircularProgress className={classes.progress} color="secondary" />
      {message && <div className={classes.message}>{message}</div>}
    </>
  )
}

export default LoadingIndicator
