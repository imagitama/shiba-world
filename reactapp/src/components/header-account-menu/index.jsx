import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import * as routes from '../../routes'
import useUserRecord from '../../hooks/useUserRecord'

import Avatar, { sizes } from '../avatar'
import Button from '../button'
import NotificationsMenuLabel from '../notifications-menu-label'
import NotificationsMenuChildren from '../notifications-menu-children'

const useStyles = makeStyles({
  toggle: {
    display: 'flex',
    alignItems: 'center'
  },
  uploadBtn: {
    marginRight: '1rem'
  },
  notifications: {
    marginRight: '1rem',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  link: {
    color: 'inherit'
  },
  userDropdownBtn: {
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'pointer'
    }
  }
})

const loggedInMenuItems = [
  {
    id: 'my-account',
    url: routes.myAccount,
    label: 'My Account'
  },
  {
    id: 'my-profile',
    getUrlFromUserId: id => routes.viewUserWithVar.replace(':userId', id),
    label: 'My Profile'
  },
  {
    id: 'sign-out',
    url: routes.logout,
    label: 'Logout'
  }
]

const loggedOutMenuItems = [
  {
    id: 'login',
    url: routes.login,
    label: 'Log In'
  },
  {
    id: 'sign-up',
    url: routes.signUp,
    label: 'Sign Up'
  }
]

export default ({ onClose, isMobile = false }) => {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const userMenuLabelRef = useRef()
  const notificationsMenuLabelRef = useRef()
  const [
    isNotificationsDropdownOpen,
    setIsNotificationsDropdownOpen
  ] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)

  const toggleUserDropdown = () => {
    if (isUserDropdownOpen) {
      closeAllDropdowns()
    } else {
      setIsUserDropdownOpen(true)
      setIsNotificationsDropdownOpen(false)
    }
  }

  const toggleNotificationsDropdown = () => {
    if (isNotificationsDropdownOpen) {
      closeAllDropdowns()
    } else {
      setIsUserDropdownOpen(false)
      setIsNotificationsDropdownOpen(true)
    }
  }

  const closeAllDropdowns = () => {
    onClose()
    setIsUserDropdownOpen(false)
    setIsNotificationsDropdownOpen(false)
  }

  const menuItems = user ? loggedInMenuItems : loggedOutMenuItems

  const MenuOrMenuList = props => {
    if (isMobile) {
      if (props.open) {
        return <MenuList {...props} />
      } else {
        return null
      }
    }
    return <Menu {...props} />
  }

  return (
    <ClickAwayListener onClickAway={closeAllDropdowns}>
      <div className={classes.root}>
        <span className={classes.toggle}>
          {user && (
            <Button
              url={routes.createAsset}
              className={classes.uploadBtn}
              onClick={closeAllDropdowns}>
              Upload
            </Button>
          )}
          {user && (
            <div
              ref={notificationsMenuLabelRef}
              className={classes.notifications}
              onClick={() => toggleNotificationsDropdown()}>
              <NotificationsMenuLabel />
            </div>
          )}
          <div
            ref={userMenuLabelRef}
            onClick={() => toggleUserDropdown()}
            className={classes.userDropdownBtn}>
            <Avatar url={user ? user.avatarUrl : false} size={sizes.TINY} />
            <div className={classes.dropdownIcon}>
              <KeyboardArrowDownIcon className={classes.icon} />
            </div>
          </div>
        </span>
        <MenuOrMenuList
          anchorEl={userMenuLabelRef.current}
          getContentAnchorEl={null}
          open={isUserDropdownOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}>
          {menuItems.map(({ id, url, label, getUrlFromUserId }) => (
            <MenuItem key={id}>
              <Link
                to={getUrlFromUserId ? getUrlFromUserId(user.id) : url}
                className={classes.link}
                onClick={closeAllDropdowns}>
                {label}
              </Link>
            </MenuItem>
          ))}
        </MenuOrMenuList>
        <MenuOrMenuList
          anchorEl={notificationsMenuLabelRef.current}
          getContentAnchorEl={null}
          open={isNotificationsDropdownOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}>
          <NotificationsMenuChildren onClose={onClose} isMobile={isMobile} />
        </MenuOrMenuList>
      </div>
    </ClickAwayListener>
  )
}
