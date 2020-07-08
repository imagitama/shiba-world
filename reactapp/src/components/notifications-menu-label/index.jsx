import useDatabaseQuery, {
  CollectionNames,
  NotificationsFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { createRef } from '../../utils'

function getValueForNotifications(isLoading, isErrored, results) {
  if (isLoading) {
    return '...'
  }

  if (isErrored) {
    return '?'
  }

  return results.length
}

export default () => {
  const userId = useFirebaseUserId()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Notifications,
    userId
      ? [
          [
            NotificationsFieldNames.recipient,
            Operators.EQUALS,
            createRef(CollectionNames.Users, userId)
          ]
        ]
      : false // do not query if not logged in
  )

  return `Notifications (${getValueForNotifications(
    isLoading,
    isErrored,
    results
  )})`
}
