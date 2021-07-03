import { alreadyOver18Key } from '../config'
import { UserFieldNames } from './useDatabaseQuery'
import useStorage from './useStorage'
import useUserRecord from './useUserRecord'

export default () => {
  const [, , user] = useUserRecord()
  const [isAlreadyOver18] = useStorage(alreadyOver18Key)

  let isEnabled = false

  if (user && user[UserFieldNames.enabledAdultContent]) {
    isEnabled = true
  }

  if (isAlreadyOver18) {
    isEnabled = true
  }

  return isEnabled
}
