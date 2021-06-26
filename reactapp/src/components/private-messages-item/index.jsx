import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import FormattedDate from '../formatted-date'
import Avatar, { sizes } from '../avatar'

const backgroundColor = 'rgba(255, 255, 255, 0.1)'
const borderColor = 'rgba(255, 255, 255, 0.1)'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    position: 'relative'
  },
  user: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 1rem 0 0'
  },
  username: {
    fontSize: '75%',
    marginTop: '0.25rem'
  },
  content: {
    width: '100%'
  },
  fromSelf: {
    flexDirection: 'row-reverse',
    '& $user': {
      margin: '0 0 0 1rem'
    }
  },
  message: {
    padding: '0 1rem',
    borderRadius: '0.5rem',
    background: backgroundColor,
    border: `1px solid ${borderColor}`
  },
  meta: {
    marginTop: '0.25rem',
    fontSize: '0.5rem',
    color: 'rgba(255, 255, 255, 0.5)'
  },
  arrow: {
    position: 'absolute'
  }
})

export default ({ message: { message, createdAt, createdBy } }) => {
  const userId = useFirebaseUserId()
  const classes = useStyles()
  const isMessageFromSelf = createdBy.id === userId
  return (
    <div
      className={`${classes.root} ${
        isMessageFromSelf ? classes.fromSelf : ''
      }`}>
      <div className={classes.user}>
        <Avatar url={createdBy[UserFieldNames.avatarUrl]} size={sizes.TINY} />
        <div className={classes.username}>
          {createdBy[UserFieldNames.username]}
        </div>
      </div>
      <div className={classes.content}>
        <div className={classes.message}>
          <Markdown source={message} />
        </div>
        <div className={classes.meta}>
          <FormattedDate date={createdAt} />
        </div>
      </div>
      <div className={classes.arrow} />
    </div>
  )
}
