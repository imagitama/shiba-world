import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
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
    color: '#240b36' // TODO: get from theme
  },
  menuItemLink: {
    display: 'block',
    width: '100%',
    height: '100%',
    color: 'inherit'
  }
})

const NavigationLink = props => {
  const classes = useStyles()
  return <Link {...props} className={classes.menuItemLink} />
}

export default () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const isMenuOpen = useSelector(({ app }) => app.isMenuOpen)
  const dispatch = useDispatch()

  const dispatchCloseMenu = () => dispatch(closeMenu())

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
          .map(({ label, url }) => (
            <MenuItem button key={url} onClick={dispatchCloseMenu}>
              <NavigationLink
                className={classes.menuListLink}
                color="primary"
                variant="inherit"
                to={url}>
                <Typography component="div" style={{ display: 'flex' }}>
                  <ListItemIcon className={classes.listItemIcon}>
                    <ChevronRightIcon />
                  </ListItemIcon>
                  {getLabelForMenuItem(label)}
                </Typography>
              </NavigationLink>
            </MenuItem>
          ))}
      </MenuList>
      <TwitterFollowButton />
    </Drawer>
  )
}
