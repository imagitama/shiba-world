import { useLocalStorage } from '@rehooks/local-storage'

export const keys = {
  hiddenNotices: 'hiddenNotices',
  darkModeEnabled: 'darkModeEnabled',
  assetsSortByFieldName: 'assetsSortByFieldName',
  assetsSortByDirection: 'assetsSortByDirection',
  hiddenSpecialEventNames: 'hiddenSpecialEventNames'
}

export default (key, defaultValue) => {
  const [value, ...rest] = useLocalStorage(key)
  if (!value && defaultValue) {
    return [defaultValue, ...rest]
  }
  return [value, ...rest]
}
