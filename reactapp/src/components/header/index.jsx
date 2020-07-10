import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { useMediaQuery } from 'react-responsive'
import MenuIcon from '@material-ui/icons/Menu'

import * as routes from '../../routes'
import { openMenu } from '../../modules/app'
import { ReactComponent as Logo } from '../../assets/images/logo.svg'
import {
  queryForMobiles,
  mediaQueryForMobiles,
  mediaQueryForTablets,
  mediaQueryForDesktopsOnly
} from '../../media-queries'

import Searchbar from '../searchbar'
import MobileMenu from '../mobile-menu'
import DesktopMenu from '../desktop-menu'
import DesktopAccountMenu from '../desktop-account-menu'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    padding: '1rem 1rem 0',
    borderBottom: '1px solid #260b36',
    marginBottom: '2rem',
    background: 'linear-gradient(20deg, #6e4a9e, #240b36)',
    [mediaQueryForMobiles]: {
      padding: '0.5rem 0.5rem 0',
      marginBottom: '0.5rem'
    }
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
    [mediaQueryForTablets]: {
      margin: '0'
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      marginBottom: '0.5rem'
    }
  },
  desktopMenu: {
    width: '100%'
  },
  logo: {
    '& path': {
      fill: '#FFF'
    },
    height: '100px',
    width: 'auto',
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
  }
})

export default () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const isMobile = useMediaQuery({ query: queryForMobiles })
  const dispatchOpenMenu = () => dispatch(openMenu())

  return (
    <header className={classes.root}>
      <div className={classes.cols}>
        <div className={classes.leftCol}>
          <Link
            to={routes.home}
            className={classes.logo}
            title="Go to the homepage of VRCArena">
            <Logo className={classes.logo} />
          </Link>
        </div>
        <div className={classes.rightCol}>
          <div className={classes.searchBar}>
            <div className={classes.searchBarInner}>
              <Searchbar />
            </div>
          </div>

          {!isMobile && (
            <div className={classes.desktopMenu}>
              <DesktopMenu />
            </div>
          )}
        </div>
      </div>

      <div className={classes.floatingMenu}>
        {!isMobile && <DesktopAccountMenu />}
        {isMobile && (
          <Button
            className={classes.menuToggleButton}
            onClick={dispatchOpenMenu}>
            <MenuIcon className={classes.menuToggleIcon} />
            <span hidden>Menu</span>
          </Button>
        )}
      </div>

      {isMobile && <MobileMenu />}
    </header>
  )
}
