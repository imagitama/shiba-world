import React from 'react'
import { useHistory } from 'react-router'
import SetupProfile from '../../components/setup-profile'
import ErrorMessage from '../../components/error-message'
import * as routes from '../../routes'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'

export default () => {
  const isLoggedIn = useIsLoggedIn()
  const { push } = useHistory()

  if (!isLoggedIn) {
    return <ErrorMessage>You must be logged in</ErrorMessage>
  }

  return (
    <SetupProfile
      analyticsCategory="Setup Profile"
      onDone={() => push(routes.home)}
    />
  )
}
