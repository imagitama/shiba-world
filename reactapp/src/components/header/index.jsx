import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { useMediaQuery } from 'react-responsive'
import MenuIcon from '@material-ui/icons/Menu'
import TwitterIcon from '@material-ui/icons/Twitter'

import * as routes from '../../routes'
import { openMenu } from '../../modules/app'
import { ReactComponent as Logo } from '../../assets/images/logo.svg'
import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as PatreonIcon } from '../../assets/images/icons/patreon.svg'
import {
  queryForMobiles,
  mediaQueryForMobiles,
  mediaQueryForDesktopsOnly
} from '../../media-queries'
import { trackAction } from '../../analytics'
import {
  TWITTER_URL,
  DISCORD_URL,
  PATREON_BECOME_PATRON_URL
} from '../../config'

import MobileMenu from '../mobile-menu'
import DesktopMenu from '../desktop-menu'
import DesktopAccountMenu from '../desktop-account-menu'
import ErrorMessage from '../error-message'

// when the navigation starts obstructing the logo
const mediaQueryForMenuLogoCollision = '@media (max-width: 1280px)'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    padding: '1rem',
    [mediaQueryForMobiles]: {
      padding: '0.5rem 0.5rem 0'
    }
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -5,
    background: 'linear-gradient(180deg, #322148, rgba(0,0,0,0))',
    transition: 'all 1000ms'
  },
  withBanner: {
    opacity: 0
  },
  cols: {
    display: 'flex',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap'
    }
  },
  leftCol: {
    flexShrink: 1,
    marginRight: '2%'
  },
  rightCol: {
    width: '100%'
  },
  floatingMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '1rem'
  },
  searchBar: {
    width: '100%'
  },
  searchBarInner: {
    width: '50%',
    margin: '0.5rem auto 0',
    [mediaQueryForMobiles]: {
      width: '100%',
      marginBottom: '0.5rem'
    }
  },
  desktopMenu: {
    width: '100%'
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'start',
    position: 'absolute',
    top: 0,
    left: 0,
    margin: '1rem',
    [mediaQueryForMobiles]: {
      position: 'relative',
      padding: 0
    }
  },
  socialIcons: {
    marginLeft: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    '& a': {
      display: 'flex',
      alignItems: 'center',
      padding: '0 0.5rem',
      opacity: '0.75',
      transition: 'all 100ms',
      '&:hover': {
        opacity: 1
      }
    },
    '& svg': {
      width: 'auto', // fix patreon icon
      height: '0.75em'
    },
    '& path': {
      fill: '#FFF'
    }
  },
  logo: {
    '& path': {
      fill: '#FFF'
    },
    height: '100px',
    width: 'auto',
    transition: 'all 100ms',
    [mediaQueryForMenuLogoCollision]: {
      height: '75px'
    },
    [mediaQueryForMobiles]: {
      height: '75px'
    }
  },
  menuToggleButton: {
    position: 'absolute',
    top: 0,
    right: 0,

    [mediaQueryForDesktopsOnly]: {
      display: 'none'
    }
  },
  menuToggleIcon: {
    width: '4rem',
    height: '3rem',
    fill: 'white'
  },
  readOnlyMessage: {
    margin: '1rem'
  }
})

export default () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const dispatchOpenMenu = () => dispatch(openMenu())
  const bannerUrl = useSelector(({ app }) => app.bannerUrl)

  const onToggleMobileMenuClick = () => {
    dispatchOpenMenu()
    trackAction('Header', 'Click open mobile menu button')
  }

  return (
    <>
      <header className={classes.root}>
        <div className={classes.logoWrapper}>
          <Link to={routes.home} title="Go to the homepage of VRCArena">
            <Logo className={classes.logo} />
          </Link>
          <div className={classes.socialIcons}>
            <a
              href={TWITTER_URL}
              title="Visit our Twitter"
              onClick={() => trackAction('Header', 'Click visit Twitter icon')}>
              <TwitterIcon />
            </a>
            <a
              href={DISCORD_URL}
              title="Visit our Discord"
              onClick={() => trackAction('Header', 'Click visit Discord icon')}>
              <DiscordIcon />
            </a>
            <a
              href={PATREON_BECOME_PATRON_URL}
              title="Visit our Patreon"
              onClick={() => trackAction('Header', 'Click visit Patreon icon')}>
              <PatreonIcon />
            </a>
          </div>
        </div>

        <div className={classes.searchBar}>
          <div className={classes.searchBarInner} />
        </div>

        {!isMobile && (
          <div className={classes.desktopMenu}>
            <DesktopMenu />
          </div>
        )}

        <div className={classes.floatingMenu}>
          {!isMobile && <DesktopAccountMenu />}
          {isMobile && (
            <Button
              className={classes.menuToggleButton}
              onClick={onToggleMobileMenuClick}>
              <MenuIcon className={classes.menuToggleIcon} />
              <span hidden>Menu</span>
            </Button>
          )}
        </div>

        {isMobile && <MobileMenu />}

        <div
          className={`${classes.background} ${
            bannerUrl ? classes.withBanner : ''
          }`}
        />
      </header>

      <div className={classes.readOnlyMessage}>
        <ErrorMessage>
          The site is currently in read-only mode. Please visit our{' '}
          <a href="https://twitter.com/VRCArena">Twitter</a> or{' '}
          <a href="https://discord.com/invite/UVs9V58">Discord</a> for updates.
        </ErrorMessage>
      </div>
    </>
  )
}
