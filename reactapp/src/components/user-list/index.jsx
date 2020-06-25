import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import PersonIcon from '@material-ui/icons/Person'
import * as routes from '../../routes'

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    width: '200px',
    height: '200px',
    textAlign: 'center',
    position: 'relative'
  },
  itemContents: {
    alignItems: 'center'
  },
  icon: {
    display: 'inline-block',
    fontSize: '400%'
  },
  name: {
    display: 'block',
    fontSize: '150%'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  }
})

function User({ user }) {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Link
        to={routes.viewUserWithVar.replace(':userId', user.id)}
        title={`View the user profile for user ${user.username}`}
        className={classes.link}>
        <div className={classes.itemContents}>
          <PersonIcon className={classes.icon} />
          <span className={classes.name}>{user.username}</span>
        </div>
      </Link>
    </div>
  )
}

export default ({ users }) => {
  const classes = useStyles()
  return (
    <div className={classes.container}>
      {users.map(user => (
        <User key={user.id} user={user} />
      ))}
    </div>
  )
}
