import { trackAction, actions } from '../analytics'
import { keys } from '../hooks/useStorage'

const initialState = {
  isMenuOpen: false,
  searchTerm: '',
  darkModeEnabled: localStorage.getItem(keys.darkModeEnabled) === 'true'
}

const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'
const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM'
const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'

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
