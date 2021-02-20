import { UserFieldNames } from './hooks/useDatabaseQuery'

export function canEditUsers(user) {
  if (!user) {
    return false
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}

export function canEditComments(user) {
  if (!user) {
    return false
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}

export function canCreateDiscordServer(user) {
  if (!user) {
    return false
  }
  return true
}

export function canEditDiscordServer(user) {
  if (!user) {
    return false
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}

export function canEditProduct(user) {
  if (!user) {
    return false
  }
  return user[UserFieldNames.isAdmin] || user[UserFieldNames.isEditor]
}
