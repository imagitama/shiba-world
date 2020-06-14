import React, { useState, useRef } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import useUserRecord from '../../hooks/useUserRecord'
import TwitterFollowButton from '../twitter-follow-button'
import navItems, {
  canShowMenuItem,
  getLabelForMenuItem
} from '../../navigation'

const useStyles = makeStyles({
  root: {
    marginTop: '2rem',
    flexWrap: 'wrap',
    display: 'flex'
  },
  menuItem: {
    color: '#FFF', // TODO: Get from theme
    '&:first-child': {
      menuItemLabel: {
        paddingLeft: 0
      }
    }
  },
  menuItemLabel: {
    padding: '1rem',
    color: 'inherit',
    display: 'flex', // for icon
    '&:hover': {
      cursor: 'pointer'
    }
  },
  icon: {
    marginTop: '-2px'
  }
})

function Dropdown({ label, items, isOpen, onOpen, onClose }) {
  const { push } = useHistory()
  const labelRef = useRef()
  const classes = useStyles()

  const onClickItem = url => {
    push(url)
    onClose()
  }

  return (
    <ClickAwayListener onClickAway={onClose}>
      <span>
        <span ref={labelRef} onClick={onOpen} className={classes.menuItemLabel}>
          {label} <KeyboardArrowDownIcon className={classes.icon} />
        </span>
        <Menu anchorEl={labelRef.current} open={isOpen}>
          {items.map(({ label, url }) => (
            <MenuItem key={url} onClick={() => onClickItem(url)}>
              {label}
            </MenuItem>
          ))}
        </Menu>
      </span>
    </ClickAwayListener>
  )
}

export default () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [openMenuItems, setOpenMenuItems] = useState({})

  const openMenuDropdown = idx =>
    setOpenMenuItems({ ...openMenuItems, [idx]: true })
  const closeMenuDropdown = idx =>
    setOpenMenuItems({ ...openMenuItems, [idx]: false })

  return (
    <div className={classes.root}>
      {navItems
        .filter(navItem => canShowMenuItem(navItem, user))
        .map(({ label, url, children }, idx) => {
          const actualLabel = getLabelForMenuItem(label)

          return (
            <div key={url} className={classes.menuItem}>
              {children ? (
                <Dropdown
                  label={actualLabel}
                  items={children}
                  isOpen={openMenuItems[idx]}
                  onOpen={() => openMenuDropdown(idx)}
                  onClose={() => closeMenuDropdown(idx)}
                />
              ) : (
                <Link to={url} className={classes.menuItemLabel}>
                  {actualLabel}
                </Link>
              )}
            </div>
          )
        })}

      <TwitterFollowButton />
    </div>
  )
}
