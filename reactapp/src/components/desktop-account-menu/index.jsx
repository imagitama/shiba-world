import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'

import * as routes from '../../routes'
import useUserRecord from '../../hooks/useUserRecord'
import { trackAction } from '../../analytics'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'
import { isFallbackImageDefinition } from '../../utils'

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
  },
  dropdownIcon: {
    color: '#FFF'
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

export default () => {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const userMenuLabelRef = useRef()
  const notificationsMenuLabelRef = useRef()
  const [openId, setOpenId] = useState(null)

  const toggleUserDropdown = () => {
    if (openId === 'user') {
      closeAllDropdowns()
    } else {
      setOpenId('user')
      trackAction('DesktopAccountMenu', 'Open user dropdown')
    }
  }

  const toggleNotificationsDropdown = () => {
    if (openId === 'notifications') {
      closeAllDropdowns()
    } else {
      setOpenId('notifications')
      trackAction('DesktopAccountMenu', 'Open notifications dropdown')
    }
  }

  const closeAllDropdowns = () => setOpenId(null)

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
            size={sizes.TINY}
          />
          <div className={classes.dropdownIcon}>
            <KeyboardArrowDownIcon className={classes.icon} />
          </div>
        </div>
      </span>
      <Menu
        anchorEl={userMenuLabelRef.current}
        getContentAnchorEl={null}
        open={openId === 'user'}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        onClose={closeAllDropdowns}>
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
      </Menu>
      <Menu
        anchorEl={notificationsMenuLabelRef.current}
        getContentAnchorEl={null}
        open={openId === 'notifications'}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        onClose={closeAllDropdowns}>
        <NotificationsMenuChildren onClose={closeAllDropdowns} />
      </Menu>
    </>
  )
}
