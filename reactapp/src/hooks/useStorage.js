import { useLocalStorage } from '@rehooks/local-storage'

export const keys = {
  hiddenNotices: 'hiddenNotices',
  darkModeEnabled: 'darkModeEnabled',
  assetsSortByFieldName: 'assetsSortByFieldName',
  assetsSortByDirection: 'assetsSortByDirection'
}

export default (key, defaultValue) => {
  const value = useLocalStorage(key)
  if (!value && defaultValue) {
    return defaultValue
  }
  return value
}
