import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  hint: { color: 'grey', marginTop: '0.5rem' }
})

export default ({ children }) => {
  const classes = useStyles()
  return <div className={classes.hint}>{children}</div>
}
