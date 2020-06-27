import React, { Fragment, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import Drawer from '@material-ui/core/Drawer'
import MenuList from '@material-ui/core/MenuList'
import MenuItem from '@material-ui/core/MenuItem'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import useUserRecord from '../../hooks/useUserRecord'
import { closeMenu } from '../../modules/app'
import navItems, {
  canShowMenuItem,
  getLabelForMenuItem
} from '../../navigation'
import TwitterFollowButton from '../twitter-follow-button'

const useStyles = makeStyles({
  menuList: {
    width: '280px'
  },
  menuListLink: {
    color: 'inherit',
    textDecoration: 'none'
  },
  listItemIcon: {
    minWidth: 0,
    color: '#240b36' // TODO: get from theme
  },
  menuItemLink: {
    display: 'block',
    width: '100%',
    height: '100%',
    color: 'inherit'
  },
  label: {
    flex: 1
  },
  subMenuItem: {
    paddingLeft: '2rem'
  }
})

const NavigationLink = props => {
  const classes = useStyles()
  return <Link {...props} className={classes.menuItemLink} />
}

function MenuItemWithUrl({ onClick, url, label, className = '' }) {
  const classes = useStyles()
  return (
    <NavigationLink
      className={`${classes.menuListLink} ${className}`}
      color="primary"
      variant="inherit"
      to={url}
      onClick={onClick}>
      <Typography component="div" style={{ display: 'flex' }}>
        <span className={classes.label}>{getLabelForMenuItem(label)}</span>
        <ListItemIcon className={classes.listItemIcon}>
          <ChevronRightIcon />
        </ListItemIcon>
      </Typography>
    </NavigationLink>
  )
}
export default () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const isMenuOpen = useSelector(({ app }) => app.isMenuOpen)
  const dispatch = useDispatch()

  const dispatchCloseMenu = () => dispatch(closeMenu())

  const [openDropdownMenus, setOpenDropdownMenus] = useState({})
  const onClickDropdownParentItem = idx =>
    setOpenDropdownMenus({
      ...openDropdownMenus,
      [idx]: openDropdownMenus[idx] ? false : true
    })

  const onClickMenuItemWithUrl = () => {
    setOpenDropdownMenus({})
    dispatchCloseMenu()
  }

  return (
    <Drawer
      className={classes.drawer}
      anchor="right"
      open={isMenuOpen}
      onClose={dispatchCloseMenu}>
      <MenuList className={classes.menuList}>
        <MenuItem>VRC Arena</MenuItem>
      </MenuList>
      <Divider />
      <MenuList className={classes.menuList}>
        {navItems
          .filter(navItem => canShowMenuItem(navItem, user))
          .map(({ label, url, children }, idx) => (
            <Fragment key={label}>
              <MenuItem button>
                {children ? (
                  <Typography
                    component="div"
                    style={{ display: 'flex', width: '100%' }}
                    onClick={() => onClickDropdownParentItem(idx)}>
                    <span>{getLabelForMenuItem(label)}</span>
                    <ListItemIcon className={classes.listItemIcon}>
                      {openDropdownMenus[idx] ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </ListItemIcon>
                  </Typography>
                ) : (
                  <MenuItemWithUrl
                    url={url}
                    label={label}
                    onClick={onClickMenuItemWithUrl}
                  />
                )}
              </MenuItem>
              {openDropdownMenus[idx] &&
                children
                  .filter(navItem => canShowMenuItem(navItem, user))
                  .map(child => (
                    <MenuItem key={url} button className={classes.subMenuItem}>
                      <MenuItemWithUrl
                        url={child.url}
                        label={child.label}
                        onClick={onClickMenuItemWithUrl}
                      />
                    </MenuItem>
                  ))}
            </Fragment>
          ))}
      </MenuList>
      <TwitterFollowButton />
    </Drawer>
  )
}
