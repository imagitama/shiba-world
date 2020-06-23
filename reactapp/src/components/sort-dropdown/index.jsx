import React, { useRef, useState } from 'react'
import { writeStorage } from '@rehooks/local-storage'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import { makeStyles } from '@material-ui/core/styles'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'

import Button from '../../components/button'
import { trackAction, actions } from '../../analytics'

const useStyles = makeStyles({
  controls: {
    textAlign: 'right'
  }
})

export default ({
  options,
  label,
  fieldNameKey,
  directionKey,
  onNewSortFieldAndDirection
}) => {
  const classes = useStyles()
  const buttonRef = useRef()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const onMainBtnClick = () => {
    if (isDropdownOpen) {
      trackAction(actions.CLOSE_SORT_ASSETS_DROPDOWN)
    } else {
      trackAction(actions.OPEN_SORT_ASSETS_DROPDOWN)
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const onClickItem = (fieldName, direction) => {
    writeStorage(fieldNameKey, fieldName)
    writeStorage(directionKey, direction)
    onNewSortFieldAndDirection(fieldName, direction)
    trackAction(actions.SORT_ASSETS, { fieldName, direction })
    onClose()
  }

  const onClose = () => {
    setIsDropdownOpen(false)
    trackAction(actions.CLOSE_SORT_ASSETS_DROPDOWN)
  }

  return (
    <ClickAwayListener onClickAway={onClose}>
      <div className={classes.controls}>
        <span ref={buttonRef}>
          <Button onClick={onMainBtnClick}>
            Sort by {label}
            <KeyboardArrowDownIcon />
          </Button>
        </span>
        {isDropdownOpen && (
          <Menu
            anchorEl={buttonRef.current}
            open={isDropdownOpen}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center'
            }}
            onClose={onClose}>
            {Object.entries(options).map(
              ([label, { fieldName, direction }]) => (
                <MenuItem
                  key={`${fieldName}.${direction}`}
                  onClick={() => onClickItem(fieldName, direction)}>
                  {label}
                </MenuItem>
              )
            )}
          </Menu>
        )}
      </div>
    </ClickAwayListener>
  )
}
