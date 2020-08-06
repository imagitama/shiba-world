import { UserFieldNames } from './hooks/useDatabaseQuery'

export function canEditUsers(user) {
  if (!user) {
    return
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}
