import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'
import { scrollToTop } from '../../utils'
import { trackAction } from '../../analytics'
import useGuestUserRecord from '../../hooks/useGuestUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

const useStyles = makeStyles({
  footer: {
    margin: '3rem 0 0 0',
    padding: '1rem 2rem',
    fontSize: '16px',
    display: 'flex'
  },
  col: {
    width: '50%'
  },
  colRight: {
    textAlign: 'right'
  },
  scrollToTopBtnWrapper: {
    marginTop: '3rem',
    textAlign: 'center'
  }
})

function ScrollToTopBtn() {
  const classes = useStyles()
  const { pathname } = useLocation()

  if (pathname === '/') {
    return null
  }

  return (
    <div className={classes.scrollToTopBtnWrapper}>
      <Button
        onClick={() => {
          scrollToTop()
          trackAction('Footer', 'Click scroll to top button')
        }}
        color="default">
        Scroll To Top
      </Button>
    </div>
  )
}

const footerLinks = [
  {
    url: routes.privacyPolicy,
    label: 'Privacy Policy'
  },
  {
    url: routes.stats,
    label: 'Stats'
  }
]

export default () => {
  const uid = useFirebaseUserId()
  const [, , guestUser] = useGuestUserRecord()
  const classes = useStyles()

  return (
    <>
      <ScrollToTopBtn />
      <footer className={classes.footer}>
        <div className={classes.col}>
          {uid ? (
            <span title={uid}>You are logged in</span>
          ) : guestUser ? (
            <span title={`${guestUser.id} ${guestUser.ipAddress}`}>
              You are logged out (guest)
            </span>
          ) : (
            'You are logged out'
          )}
        </div>
        <div className={`${classes.col} ${classes.colRight}`}>
          &copy; {new Date().getFullYear()}{' '}
          <a href="https://www.jaredwilliams.com.au">Jared Williams</a> &ndash;{' '}
          {footerLinks.map(({ url, label }, idx) => (
            <span key={url}>
              {idx !== 0 ? <> &ndash; </> : null}
              <Link to={url}>{label}</Link>
            </span>
          ))}
        </div>
      </footer>
    </>
  )
}
