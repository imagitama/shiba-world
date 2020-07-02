import { inDevelopment } from './environment'

const categories = {
  ROUTING: 'Routing',
  AUTH: 'Auth',
  ASSETS: 'Assets',
  APP: 'App',
  COMMENTS: 'Comments',
  REQUESTS: 'Requests'
}

export const actions = {
  // APP
  NAVIGATE: 'Navigate',
  OPEN_NAV_MENU: 'OpenNavMenu',
  CLOSE_NAV_MENU: 'CloseNavMenu',
  SET_DARK_MODE_ENABLED: 'SetDarkModeEnabled',

  // AUTH
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  SIGNUP: 'SignUp',
  CHANGE_USERNAME: 'ChangeUsername',

  // SEARCH
  FOCUS_SEARCH: 'FocusSearch',
  CHANGE_SEARCH_TERM: 'ChangeSearchTerm',

  // ASSETS
  COMMENT_ON_ASSET: 'CommentOnAsset',
  DOWNLOAD_ASSET: 'DownloadAsset',
  DOWNLOAD_ASSET_FILE: 'DownloadAssetFile',
  ENDORSE_ASSET: 'EndorseAsset',
  APPROVE_ASSET: 'ApproveAsset',
  UNAPPROVE_ASSET: 'UnapproveAsset',
  DELETE_ASSET: 'DeleteAsset',
  RESTORE_ASSET: 'RestoreAsset',
  SORT_ASSETS: 'SortAssets',
  OPEN_SORT_ASSETS_DROPDOWN: 'OpenSortAssetsDropdown',
  CLOSE_SORT_ASSETS_DROPDOWN: 'CloseSortAssetsDropdown',
  REPORT_ASSET: 'ReportAsset',
  PIN_ASSET: 'PinAsset',
  UNPIN_ASSET: 'UnpinAsset',
  VISIT_SOURCE: 'VisitSource',

  // ACCOUNT
  TOGGLE_ENABLED_ADULT_CONTENT: 'ToggleEnabledAdultContent',

  HIDE_NOTICE: 'HideNotice',
  TOGGLE_DARK_MODE: 'ToggleDarkMode',

  // COMMENTS
  CREATE_COMMENT: 'CreateComment',

  // REQUESTS
  OPEN_REQUEST: 'OpenRequest',
  CLOSE_REQUEST: 'CloseRequest',
  CREATE_REQUEST: 'CreateRequest',
  EDIT_REQUEST: 'EditRequest'
}

const actionDetails = {
  // ROUTING

  [actions.NAVIGATE]: {
    category: categories.ROUTING
  },
  [actions.OPEN_NAV_MENU]: {
    category: categories.ROUTING
  },
  [actions.CLOSE_NAV_MENU]: {
    category: categories.ROUTING
  },

  // AUTH

  [actions.LOGIN]: {
    category: categories.AUTH
  },
  [actions.LOGOUT]: {
    category: categories.AUTH
  },
  [actions.SIGNUP]: {
    category: categories.AUTH
  },
  [actions.CHANGE_USERNAME]: {
    category: categories.AUTH
  },

  // SEARCH

  [actions.FOCUS_SEARCH]: {
    category: categories.LISTS
  },
  [actions.CHANGE_SEARCH_TERM]: {
    category: categories.LISTS
  },

  [actions.CREATE_COMMENT]: {
    category: categories.COMMENTS
  },

  // ASSETS

  [actions.COMMENT_ON_ASSET]: {
    category: categories.ASSETS
  },
  [actions.DOWNLOAD_ASSET_FILE]: {
    category: categories.ASSETS
  },
  [actions.DOWNLOAD_ASSET]: {
    category: categories.ASSETS
  },
  [actions.ENDORSE_ASSET]: {
    category: categories.ASSETS
  },
  [actions.APPROVE_ASSET]: {
    category: categories.ASSETS
  },
  [actions.DELETE_ASSET]: {
    category: categories.ASSETS
  },
  [actions.RESTORE_ASSET]: {
    category: categories.ASSETS
  },
  [actions.SORT_ASSETS]: {
    categories: categories.ASSETS
  },
  [actions.OPEN_SORT_ASSETS_DROPDOWN]: {
    categories: categories.ASSETS
  },
  [actions.CLOSE_SORT_ASSETS_DROPDOWN]: {
    categories: categories.ASSETS
  },
  [actions.REPORT_ASSET]: {
    categories: categories.ASSETS
  },
  [actions.VISIT_SOURCE]: {
    categories: categories.ASSETS
  },

  // OTHER - APP
  [actions.HIDE_NOTICE]: {
    category: categories.APP
  },
  [actions.TOGGLE_DARK_MODE]: {
    category: categories.APP
  },
  [actions.SET_DARK_MODE_ENABLED]: {
    caregory: categories.APP
  },

  // REQUESTS
  [actions.CREATE_REQUEST]: {
    category: categories.REQUESTS
  },
  [actions.EDIT_REQUEST]: {
    category: categories.REQUESTS
  },
  [actions.CLOSE_REQUEST]: {
    category: categories.REQUESTS
  },
  [actions.OPEN_REQUEST]: {
    category: categories.REQUESTS
  }
}

export const trackAction = (name, payload) => {
  if (inDevelopment()) {
    return
  }

  const { category } = actionDetails[name]

  window.gtag('event', name, {
    event_category: category,
    event_label: JSON.stringify(payload)
  })
}
