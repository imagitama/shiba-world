import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Badge from '@material-ui/core/Badge'
import NotificationsIcon from '@material-ui/icons/Notifications'
import useDatabaseQuery, {
  CollectionNames,
  NotificationsFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  root: {
    display: 'flex' // fix icon alignment
  },
  icon: {
    color: '#FFF'
  }
})

export default ({ isMobile = false }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [, , results] = useDatabaseQuery(
    CollectionNames.Notifications,
    userId
      ? [
          [
            NotificationsFieldNames.recipient,
            Operators.EQUALS,
            createRef(CollectionNames.Users, userId)
          ]
        ]
      : false // do not query if not logged in
  )

  return (
    <span className={classes.root}>
      <Badge badgeContent={results ? results.length : null} color="primary">
        <NotificationsIcon className={isMobile === false ? classes.icon : ''} />
      </Badge>
    </span>
  )
}
