export const searchIndexNames = {
  ASSETS: 'prod_ASSETS',
  AUTHORS: 'prod_AUTHORS',
  USERS: 'prod_USERS'
}

export const searchIndexNameLabels = {
  [searchIndexNames.ASSETS]: 'assets',
  [searchIndexNames.AUTHORS]: 'authors',
  [searchIndexNames.USERS]: 'users'
}

function isSearchRoute() {
  return window.location.pathname.includes('search')
}

function getInitialSearchIndexName() {
  if (isSearchRoute()) {
    const chunks = window.location.pathname.split('/')
    const foundSearchIndexLabel = chunks[2]
    const foundSearchIndex = Object.entries(searchIndexNameLabels).find(
      ([, label]) => label === foundSearchIndexLabel
    )

    if (!foundSearchIndex) {
      throw new Error(
        `Found search index label "${foundSearchIndexLabel}" but no exist: ${Object.values(
          searchIndexNameLabels
        )}`
      )
    }

    return foundSearchIndex[0]
  }

  return searchIndexNames.ASSETS
}

function getInitialSearchTerm() {
  if (isSearchRoute()) {
    const chunks = window.location.pathname.split('/')
    const foundSearchIndexLabel = decodeURIComponent(chunks[3])
    return foundSearchIndexLabel
  }

  return ''
}

const initialState = {
  isMenuOpen: false,
  searchTerm: getInitialSearchTerm(),
  searchIndexName: getInitialSearchIndexName(),
  darkModeEnabled: true,
  bannerUrl: '',
  bannerFallbackUrl: '',
  searchFilters: []
}

const OPEN_MENU = 'OPEN_MENU'
const CLOSE_MENU = 'CLOSE_MENU'
const CHANGE_SEARCH_TERM = 'CHANGE_SEARCH_TERM'
const TOGGLE_DARK_MODE = 'TOGGLE_DARK_MODE'
const SET_DARK_MODE_ENABLED = 'SET_DARK_MODE_ENABLED'
const CHANGE_SEARCH_INDEX_NAME = 'CHANGE_SEARCH_INDEX_NAME'
const SET_BANNER_URLS = 'SET_BANNER_URLS'
const OVERRIDE_SEARCH_FILTER = 'OVERRIDE_SEARCH_FILTER'
const ADD_SEARCH_FILTER = 'ADD_SEARCH_FILTER'
const REMOVE_SEARCH_FILTER = 'REMOVE_SEARCH_FILTER'
const CLEAR_SEARCH_FILTERS = 'CLEAR_SEARCH_FILTERS'

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

    case CHANGE_SEARCH_INDEX_NAME:
      return {
        ...state,
        searchIndexName: action.payload.searchIndexName
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

    case SET_BANNER_URLS:
      return {
        ...state,
        bannerUrl: action.payload.url
      }

    case OVERRIDE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: [action.payload.searchFilter]
      }

    case ADD_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: state.searchFilters.concat([action.payload.searchFilter])
      }

    case REMOVE_SEARCH_FILTER:
      return {
        ...state,
        searchFilters: state.searchFilters.filter(
          id => id !== action.payload.searchFilter
        )
      }

    case CLEAR_SEARCH_FILTERS:
      return {
        ...state,
        searchFilters: []
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
}

export const closeMenu = () => dispatch => {
  dispatch({
    type: CLOSE_MENU
  })
}

export const changeSearchTerm = (searchTerm = '') => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_TERM,
    payload: {
      searchTerm
    }
  })
}

export const changeSearchIndexName = searchIndexName => dispatch => {
  dispatch({
    type: CHANGE_SEARCH_INDEX_NAME,
    payload: {
      searchIndexName
    }
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
}

export const setBannerUrls = newValue => dispatch => {
  dispatch({
    type: SET_BANNER_URLS,
    payload: {
      ...newValue
    }
  })
}

export const overrideSearchFilter = searchFilter => dispatch => {
  dispatch({
    type: OVERRIDE_SEARCH_FILTER,
    payload: {
      searchFilter
    }
  })
}

export const addSearchFilter = searchFilter => dispatch => {
  dispatch({
    type: ADD_SEARCH_FILTER,
    payload: {
      searchFilter
    }
  })
}

export const removeSearchFilter = searchFilter => dispatch => {
  dispatch({
    type: REMOVE_SEARCH_FILTER,
    payload: {
      searchFilter
    }
  })
}

export const clearSearchFilters = () => dispatch => {
  dispatch({
    type: CLEAR_SEARCH_FILTERS
  })
}
