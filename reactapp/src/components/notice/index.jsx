import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(3, 2),
    marginBottom: '1rem'
  }
}))

export default ({ title, message }) => {
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      <Typography variant="h5" component="h3">
        {title}
      </Typography>
      <Typography component="p">{message}</Typography>
    </Paper>
  )
}
