import { useLocalStorage } from '@rehooks/local-storage'

export const keys = {
  hiddenNotices: 'hiddenNotices',
  darkModeEnabled: 'darkModeEnabled'
}

export default useLocalStorage
