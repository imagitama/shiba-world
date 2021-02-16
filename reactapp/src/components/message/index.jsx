import React from 'react'
import Paper from '@material-ui/core/Paper'
import WarningIcon from '@material-ui/icons/Warning'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    margin: '1rem 0',
    padding: '1rem',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: '1rem',
    display: 'flex'
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

function Icon({ type }) {
  const classes = useStyles()
  switch (type) {
    case types.WARNING:
      return (
        <div className={classes.icon}>
          <WarningIcon />
        </div>
      )
    default:
      return null
  }
}

export default ({
  children,
  type = types.INFO,
  style = styles.DEFAULT,
  ...restOfProps
}) => {
  const classes = useStyles()

  if (style === styles.BG) {
    return (
      <div className={classes.root}>
        <Icon type={type} />
        {children}
      </div>
    )
  } else {
    return (
      <Paper className={classes.root} {...restOfProps}>
        <Icon type={type} />
        {children}
      </Paper>
    )
  }
}
