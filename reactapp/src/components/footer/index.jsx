import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import * as routes from '../../routes'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

export default () => {
  const uid = useFirebaseUserId()
  const useStyles = makeStyles({
    footer: {
      margin: '3rem 0 0 0',
      padding: '1rem 2rem',
      fontSize: '16px'
    }
  })

  const classes = useStyles()

  return (
    <footer className={classes.footer} align="right" color="">
      {uid ? (
        <span title={uid}>You are logged in</span>
      ) : (
        'You are not logged in'
      )}
      <br />
      &copy; {new Date().getFullYear()}{' '}
      <a href="https://www.jaredwilliams.com.au">Jared Williams</a> &ndash;{' '}
      <Link to={routes.privacyPolicy}>Privacy Policy</Link> &ndash;{' '}
      <Link to={routes.users}>Users</Link> &ndash;{' '}
      <Link to={routes.stats}>Stats</Link>
    </footer>
  )
}
