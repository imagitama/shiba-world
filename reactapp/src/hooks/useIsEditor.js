import { UserFieldNames } from './useDatabaseQuery'
import useUserRecord from './useUserRecord'

export default () => {
  const [, , user] = useUserRecord()
  return user && user[UserFieldNames.isEditor]
}
