import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  }
})

export default props => {
  const classes = useStyles()
  return <Paper {...props} className={classes.root} />
}
