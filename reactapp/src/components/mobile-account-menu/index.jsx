import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import * as routes from '../../routes'
import useUserRecord from '../../hooks/useUserRecord'
import { trackAction } from '../../analytics'

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

export default ({ onClose }) => {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const [openId, setOpenId] = useState(null)

  const toggleUserDropdown = () => {
    if (openId === 'user') {
      closeAllDropdowns()
    } else {
      setOpenId('user')
      trackAction('MobileAccountMenu', 'Open user dropdown')
    }
  }

  const toggleNotificationsDropdown = () => {
    if (openId === 'notifications') {
      closeAllDropdowns()
    } else {
      setOpenId('notifications')
      trackAction('MobileAccountMenu', 'Open notifications dropdown')
    }
  }
  const closeAllDropdowns = () => {
    onClose()
    setOpenId(null)
  }

  const menuItems = user ? loggedInMenuItems : loggedOutMenuItems

  return (
    <>
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
            className={classes.notifications}
            onClick={() => toggleNotificationsDropdown()}>
            <NotificationsMenuLabel isMobile />
          </div>
        )}
        <div
          onClick={() => toggleUserDropdown()}
          className={classes.userDropdownBtn}>
          <Avatar url={user ? user.avatarUrl : false} size={sizes.TINY} />
          <div className={classes.dropdownIcon}>
            <KeyboardArrowDownIcon className={classes.icon} />
          </div>
        </div>
      </span>
      <div>
        {openId === 'user' && (
          <MenuList>
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
          </MenuList>
        )}
        {openId === 'notifications' && (
          <MenuList>
            <NotificationsMenuChildren onClose={closeAllDropdowns} isMobile />
          </MenuList>
        )}
      </div>
    </>
  )
}
