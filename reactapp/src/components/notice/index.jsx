import React from 'react'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { writeStorage } from '@rehooks/local-storage'
import CloseIcon from '@material-ui/icons/Close'
import Markdown from 'react-markdown'
import useStorage, { keys } from '../../hooks/useStorage'
import { trackAction, actions } from '../../analytics'
import Avatar, { sizes } from '../avatar'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 2),
    marginBottom: '2rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  leftCol: {
    flexShrink: 0,
    marginRight: '1%'
  },
  rightCol: {},
  message: {
    marginTop: theme.spacing(1),
    '& p:last-child': {
      marginBottom: 0
    }
  },
  hideBtn: {
    position: 'absolute',
    padding: '0.5rem',
    top: 0,
    right: 0,
    '&:hover': {
      cursor: 'pointer'
    }
  }
}))

export default ({ id, title, message, createdBy }) => {
  const classes = useStyles()
  const [hiddenNotices] = useStorage(keys.hiddenNotices, [])
  const onHideBtnClick = () => {
    writeStorage(keys.hiddenNotices, hiddenNotices.concat([id]))

    trackAction(actions.HIDE_NOTICE, {
      id
    })
  }

  if (hiddenNotices.includes(id)) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      <div className={classes.leftCol}>
        <Avatar
          url={createdBy.avatarUrl}
          username={createdBy.username}
          size={sizes.SMALL}
        />
      </div>
      <div className={classes.rightCol}>
        <Typography variant="h5" component="h3">
          {title}
        </Typography>
        <div className={classes.message}>
          <Markdown source={message} />
        </div>
        <div className={classes.hideBtn} onClick={onHideBtnClick}>
          <CloseIcon />
        </div>
      </div>
    </Paper>
  )
}
