import React from 'react'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'

export default ({ history: { push } }) => {
  const [, , user] = useUserRecord()

  // useEffect(() => {
  //   if (user) {
  //     trackAction('Login', 'User visited but already logged in')
  //   }
  // }, [user === null])

  if (user) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Login</Heading>
      <BodyText>Enter your details below to login.</BodyText>
      <LoginForm
        onSuccess={() => {
          trackAction('Login', 'Click login button')
          push(routes.home)
        }}
      />
      <BodyText>
        You can read our <Link to={routes.privacyPolicy}>Privacy Policy</Link>{' '}
        here.
      </BodyText>
    </>
  )
}
