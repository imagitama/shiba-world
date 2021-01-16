import React from 'react'
import EditIcon from '@material-ui/icons/Edit'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles({
  root: {
    width: '40px',
    height: '40px',
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    padding: '5px',
    background: 'rgba(166, 114, 80, 0.3)', // todo: get from theme
    borderRadius: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100
  }
})

export default ({ onClick }) => {
  const classes = useStyles()
  return (
    <div className={classes.root} onClick={onClick}>
      <EditIcon />
    </div>
  )
}
