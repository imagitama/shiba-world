import React from 'react'
import Paper from '@material-ui/core/Paper'
import WarningIcon from '@material-ui/icons/Warning'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

const useStyles = makeStyles(() => ({
  root: {
    margin: '1rem 0',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  text: {
    width: '100%'
  },
  icon: {
    marginRight: '1rem',
    display: 'flex'
  },
  middleAlign: {
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

function Icon({ type }) {
  const classes = useStyles()
  switch (type) {
    case types.WARNING:
      return (
        <div className={classes.icon}>
          <WarningIcon />
        </div>
      )
    case types.SUCCESS:
      return (
        <div className={classes.icon}>
          <CheckIcon />
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
  const textClasses = `${classes.text} ${
    type === types.WARNING || type === types.SUCCESS ? classes.middleAlign : ''
  }`

  if (style === styles.BG) {
    return (
      <div className={classes.root}>
        <Icon type={type} />
        <span className={textClasses}>{children}</span>
      </div>
    )
  } else {
    return (
      <Paper className={classes.root} {...restOfProps}>
        <Icon type={type} />
        <span className={textClasses}>{children}</span>
      </Paper>
    )
  }
}
