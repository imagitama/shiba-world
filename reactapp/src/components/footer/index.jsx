import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import * as routes from '../../routes'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import Button from '../button'
import { scrollToTop } from '../../utils'

const useStyles = makeStyles({
  footer: {
    margin: '3rem 0 0 0',
    padding: '1rem 2rem',
    fontSize: '16px'
  },
  scrollToTopBtnWrapper: {
    marginTop: '3rem',
    textAlign: 'center'
  }
})

function ScrollToTopBtn() {
  const classes = useStyles()

  return (
    <div className={classes.scrollToTopBtnWrapper}>
      <Button onClick={() => scrollToTop()} color="default">
        Scroll To Top
      </Button>
    </div>
  )
}

export default () => {
  const uid = useFirebaseUserId()
  const classes = useStyles()

  return (
    <>
      <ScrollToTopBtn />
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
        <Link to={routes.activity}>Activity</Link> &ndash;{' '}
        <Link to={routes.stats}>Stats</Link>
      </footer>
    </>
  )
}
