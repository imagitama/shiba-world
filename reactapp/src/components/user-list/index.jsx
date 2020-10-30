import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'
import { isFallbackImageDefinition } from '../../utils'

import Avatar, { sizes } from '../avatar'

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
    fontSize: '150%',
    marginTop: '0.5rem'
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
  },
  avatar: {
    margin: '0 auto'
  }
})

function User({ user }) {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Link
        to={routes.viewUserWithVar.replace(':userId', user.id)}
        title={`View the user profile for user ${
          user[UserFieldNames.username]
        }`}
        className={classes.link}>
        <div className={classes.itemContents}>
          <Avatar
            url={
              user && user[UserFieldNames.avatarUrl]
                ? isFallbackImageDefinition(user[UserFieldNames.avatarUrl])
                  ? user[UserFieldNames.avatarUrl].url
                  : user[UserFieldNames.avatarUrl]
                : null
            }
            fallbackUrl={
              user &&
              user[UserFieldNames.avatarUrl] &&
              isFallbackImageDefinition(user[UserFieldNames.avatarUrl])
                ? user[UserFieldNames.avatarUrl].fallbackUrl
                : null
            }
            size={sizes.SMALL}
            className={classes.avatar}
          />
          <span className={classes.name}>
            {user[UserFieldNames.username] || '(no name set)'}
          </span>
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
