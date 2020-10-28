import React, { useRef, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import ThemeProvider from '@material-ui/styles/ThemeProvider'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

import {
  changeSearchTerm,
  changeSearchIndexName,
  searchIndexNames,
  searchIndexNameLabels
} from '../../modules/app'
import { lightTheme } from '../../themes'
import * as routes from '../../routes'
import { convertSearchTermToUrlPath } from '../../utils'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    padding: '2px 2px 2px 24px',
    borderRadius: '3rem',
    display: 'flex',
    alignItems: 'center',
    '@media (min-width: 960px)': {
      margin: '0 auto'
    }
  },
  input: {
    padding: 10,
    marginLeft: 8,
    flex: 1
  },
  dropdown: {
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(0, 0, 0, 0.4)',
    '&:hover': {
      cursor: 'pointer'
    }
  }
})

function getLabelForSearchIndexName(searchIndexName) {
  switch (searchIndexName) {
    case searchIndexNames.ASSETS:
      return 'Assets'
    case searchIndexNames.AUTHORS:
      return 'Authors'
    case searchIndexNames.USERS:
      return 'Users'
    default:
      return '?'
  }
}

function getPlaceholderForSearchIndexName(searchIndexName) {
  switch (searchIndexName) {
    case searchIndexNames.ASSETS:
      return 'Search assets'
    case searchIndexNames.AUTHORS:
      return 'Search authors'
    case searchIndexNames.USERS:
      return 'Search users'
    default:
      return '?'
  }
}

function updateUrlWithSearchData(indexName, searchTerm) {
  window.history.replaceState(
    null,
    'Search',
    routes.searchWithVar
      .replace(':indexName', searchIndexNameLabels[indexName])
      .replace(':searchTerm', convertSearchTermToUrlPath(searchTerm))
  )
}

export default () => {
  const { searchTerm, searchIndexName } = useSelector(
    ({ app: { searchTerm, searchIndexName } }) => ({
      searchTerm,
      searchIndexName
    })
  )
  const dispatch = useDispatch()
  const classes = useStyles()
  const dropdownMenuBtnRef = useRef()
  const [isIndexDropdownOpen, setIsIndexDropdownOpen] = useState(false)

  const onSearchTermInputChange = event => {
    const newTerm = event.target.value

    dispatch(changeSearchTerm(newTerm))

    trackAction('Searchbar', 'Change search term', newTerm)
  }

  useEffect(() => {
    if (!searchTerm) {
      return
    }

    updateUrlWithSearchData(searchIndexName, searchTerm)
  }, [searchIndexName, searchTerm])

  return (
    <ThemeProvider theme={lightTheme}>
      <Paper className={classes.root}>
        <InputBase
          className={classes.input}
          placeholder={getPlaceholderForSearchIndexName(searchIndexName)}
          autoFocus={true}
          autoComplete="false"
          onChange={onSearchTermInputChange}
          defaultValue={searchTerm || ''}
        />
        <span
          className={classes.dropdown}
          ref={dropdownMenuBtnRef}
          onClick={() => {
            setIsIndexDropdownOpen(!isIndexDropdownOpen)
            trackAction('Searchbar', 'Open search index dropdown')
          }}>
          {getLabelForSearchIndexName(searchIndexName)} <ArrowDropDownIcon />
        </span>
        <Menu
          anchorEl={dropdownMenuBtnRef.current}
          getContentAnchorEl={null}
          open={isIndexDropdownOpen}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}>
          {Object.values(searchIndexNames).map(name => (
            <MenuItem
              key={name}
              onClick={() => {
                dispatch(changeSearchIndexName(name))
                setIsIndexDropdownOpen(false)
                trackAction(
                  'Searchbar',
                  'Change search index name',
                  searchIndexNameLabels[name]
                )
              }}>
              {getLabelForSearchIndexName(name)}
            </MenuItem>
          ))}
        </Menu>
      </Paper>
    </ThemeProvider>
  )
}
