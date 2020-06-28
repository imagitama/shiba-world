import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { useMediaQuery } from 'react-responsive'
import MenuIcon from '@material-ui/icons/Menu'

import * as routes from '../../routes'
import { openMenu } from '../../modules/app'
import { ReactComponent as Logo } from '../../assets/images/logo.svg'
import {
  mediaQueryForTabletsOrBelow,
  mediaQueryForDesktopsOnly
} from '../../media-queries'

import Searchbar from '../searchbar'
import MobileMenu from '../mobile-menu'
import DesktopMenu from '../desktop-menu'

const useStyles = makeStyles({
  root: {
    padding: '1.5rem 1rem 0',
    borderBottom: '1px solid #260b36',
    marginBottom: '2rem',
    background: 'linear-gradient(20deg, #6e4a9e, #240b36)',
    [mediaQueryForTabletsOrBelow]: {
      order: '3',
      padding: '0.5rem 0.5rem 0'
    }
  },
  gridColSearchbar: {
    [mediaQueryForTabletsOrBelow]: {
      order: '3',
      padding: '0 1rem'
    }
  },
  logo: {
    [mediaQueryForTabletsOrBelow]: {
      padding: '1rem 0 0'
    },
    '& path': {
      fill: '#FFF'
    },
    height: '100px',
    width: 'auto',
    marginLeft: '0.5rem'
  },
  menuToggleButton: {
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
  const isMobile = useMediaQuery({ query: '(max-width: 959px)' })
  const dispatchOpenMenu = () => dispatch(openMenu())

  return (
    <header className={classes.root}>
      <Grid container>
        <Grid item xs={8} md={4} lg={4} align="left">
          <Link
            to={routes.home}
            className={classes.logo}
            title="Go to the homepage of VRCArena">
            <Logo className={classes.logo} />
          </Link>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          lg={4}
          className={classes.gridColSearchbar}
          align="center">
          <Searchbar />
        </Grid>
        <Grid item xs={4} align="right">
          {isMobile && (
            <Button
              className={classes.menuToggleButton}
              onClick={dispatchOpenMenu}>
              <MenuIcon className={classes.menuToggleIcon} />
              <span hidden>Menu</span>
            </Button>
          )}
        </Grid>
      </Grid>
      {isMobile && <MobileMenu />}
      {!isMobile && <DesktopMenu />}
    </header>
  )
}
