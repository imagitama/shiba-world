import { useLocalStorage } from '@rehooks/local-storage'

export const keys = {
  hiddenNotices: 'hiddenNotices',
  darkModeEnabled: 'darkModeEnabled',
  assetsSortByFieldName: 'assetsSortByFieldName',
  assetsSortByDirection: 'assetsSortByDirection'
}

export default useLocalStorage
