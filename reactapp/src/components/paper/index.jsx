import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    padding: '1rem',
    transition: 'all 100ms'
  },
  hover: {
    '&:hover': {
      backgroundColor: 'grey',
      boxShadow: `0px 0px 10px ${theme.palette.paper.hover.shadow}`
    }
  },
  selected: {
    backgroundColor: 'grey',
    boxShadow: `0px 0px 10px ${theme.palette.paper.selected.shadow}`
  }
}))

export default ({ hover = false, selected = false, ...props }) => {
  const classes = useStyles()
  return (
    <Paper
      {...props}
      className={`${classes.root} ${hover ? classes.hover : ''} ${
        selected ? classes.selected : ''
      } ${props.className}`}
    />
  )
}
