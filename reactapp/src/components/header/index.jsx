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

import Searchbar from '../searchbar'
import MobileMenu from '../mobile-menu'
import DesktopMenu from '../desktop-menu'

const useStyles = makeStyles({
  root: {
    padding: '1rem 1rem',
    borderBottom: '1px solid #260b36',
    marginBottom: '2rem',
    background: 'linear-gradient(20deg, #6e4a9e, #240b36)',
    '@media (min-width: 600px)': {
      padding: '2rem 2rem 1rem'
    }
  },
  gridColSearchbar: {
    '@media (max-width: 959px)': {
      order: '3'
    }
  },
  logo: {
    '@media (max-width: 959px)': {
      padding: '1rem 0 0'
    },
    '& path': {
      fill: '#FFF'
    },
    height: '150px',
    width: 'auto'
  },
  menuToggleButton: {
    '@media (min-width: 960px)': {
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
          <Link to={routes.home} className={classes.logo}>
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
          <Button
            className={classes.menuToggleButton}
            onClick={dispatchOpenMenu}>
            <MenuIcon className={classes.menuToggleIcon} />
            <span hidden>Menu</span>
          </Button>
        </Grid>
      </Grid>
      {isMobile && <MobileMenu />}
      {!isMobile && <DesktopMenu />}
    </header>
  )
}
