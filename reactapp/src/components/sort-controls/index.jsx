import React, { useRef, useState } from 'react'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import { makeStyles } from '@material-ui/core/styles'

import useSorting from '../../hooks/useSorting'
import { OrderDirections } from '../../hooks/useDatabaseQuery'
import Button from '../button'

const getLabelForSelectedSortOption = (sorting, sortOptions) =>
  `${
    sortOptions.find(
      option =>
        option.fieldName === sorting.fieldName &&
        option.direction === sorting.direction
    ).label
  }`

const appendDirections = options => {
  const newOptions = []

  for (const { fieldName, label } of options) {
    newOptions.push({
      fieldName,
      label: `${label} (${OrderDirections.ASC})`,
      direction: OrderDirections.ASC
    })

    newOptions.push({
      fieldName,
      label: `${label} (${OrderDirections.DESC})`,
      direction: OrderDirections.DESC
    })
  }

  return newOptions
}

const useStyles = makeStyles({
  controls: {
    textAlign: 'right'
  }
})

export default ({ sortKey, options, defaultFieldName = '' }) => {
  const [sorting, setSorting] = useSorting(sortKey, defaultFieldName)
  const buttonRef = useRef()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const classes = useStyles()

  const optionsWithDirections = appendDirections(options)

  const onClickItem = (fieldName, direction) =>
    setSorting({
      fieldName,
      direction
    })

  return (
    <div className={classes.controls}>
      <span ref={buttonRef}>
        <Button onClick={() => setIsDropdownOpen(currentVal => !currentVal)}>
          Sort by{' '}
          {getLabelForSelectedSortOption(sorting, optionsWithDirections)}
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
          onClose={() => setIsDropdownOpen(false)}>
          {optionsWithDirections.map(({ fieldName, label, direction }) => (
            <MenuItem
              key={`${fieldName}.${direction}`}
              onClick={() => onClickItem(fieldName, direction)}>
              {label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  )
}
