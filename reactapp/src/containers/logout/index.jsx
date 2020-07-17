import React, { useEffect } from 'react'
import { logout } from '../../firebase'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

export default ({ history: { push } }) => {
  const [isLoading, isErrored, user] = useUserRecord()

  useEffect(() => {
    if (isLoading || isErrored) {
      return
    }

    if (!user) {
      trackAction('Logout', 'User tried to logout but was already logged out')
      return
    }

    logout()

    trackAction('Logout', 'Auto-logout user')

    setTimeout(() => push(routes.home), 1500)
  }, [isLoading, isErrored, user === null])

  return <>You are now logged out. Redirecting you to homepage...</>
}
