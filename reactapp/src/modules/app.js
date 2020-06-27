import { trackAction, actions } from '../analytics'
import { keys } from '../hooks/useStorage'

function getIfBrowserSetToDarkMode() {
  return (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
}

function getDarkModeEnabledInitialState() {
  if (localStorage.getItem(keys.darkModeEnabled) === 'true') {
    return true
  }

  if (localStorage.getItem(keys.darkModeEnabled) === 'false') {
    return false
  }

  if (getIfBrowserSetToDarkMode()) {
    return true
  }

  return false
}

const initialState = {
  isMenuOpen: false,
  searchTerm: '',
  darkModeEnabled: getDarkModeEnabledInitialState()
}

const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'
const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM'
const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
const SET_DARK_MODE_ENABLED = 'SET_DARK_MODE_ENABLED'

export default (state = initialState, action) => {
  switch (action.type) {
    case OPEN_MENU:
      return {
        ...state,
        isMenuOpen: true
      }

    case CLOSE_MENU:
      return {
        ...state,
        isMenuOpen: false
      }

    case CHANGE_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload.searchTerm
      }

    case TOGGLE_DARK_MODE:
      return {
        ...state,
        darkModeEnabled: !state.darkModeEnabled
      }

    case SET_DARK_MODE_ENABLED:
      return {
        ...state,
        darkModeEnabled: action.payload.newValue
      }

    default:
      return state
  }
}

// ACTIONS

export const openMenu = () => dispatch => {
  dispatch({
    type: OPEN_MENU
  })

  trackAction(actions.OPEN_NAV_MENU)
}

export const closeMenu = () => dispatch => {
  dispatch({
    type: CLOSE_MENU
  })

  trackAction(actions.CLOSE_NAV_MENU)
}

export const changeSearchTerm = searchTerm => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_TERM,
    payload: {
      searchTerm
    }
  })

  if (!searchTerm) {
    return
  }

  trackAction(actions.CHANGE_SEARCH_TERM, {
    searchTerm
  })
}

export const toggleDarkMode = () => dispatch => {
  dispatch({
    type: TOGGLE_DARK_MODE
  })
}

export const setDarkModeEnabled = newValue => dispatch => {
  dispatch({
    type: SET_DARK_MODE_ENABLED,
    payload: {
      newValue
    }
  })

  trackAction(actions.SET_DARK_MODE_ENABLED, {
    newValue
  })
}
