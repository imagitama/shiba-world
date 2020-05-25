import React, { useEffect } from 'react'
import { logout } from '../../firebase'
import * as routes from '../../routes'
import { trackAction, actions } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

export default ({ history: { push } }) => {
  const [isLoading, isErrored, user] = useUserRecord()

  useEffect(() => {
    if (isLoading || isErrored || !user) {
      return
    }

    const oldLoggedInUserId = user.id

    logout()

    trackAction(actions.LOGOUT, {
      userId: oldLoggedInUserId
    })

    setTimeout(() => push(routes.home), 1500)
  }, [isLoading, isErrored, user])

  return <>You are now logged out. Redirecting you to homepage...</>
}
