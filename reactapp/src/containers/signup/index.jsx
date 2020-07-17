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
  //     trackAction('Signup', 'User visited but already logged in')
  //   }
  // }, [user === null])

  if (user) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Sign Up</Heading>
      <BodyText>Enter your details below to create a new account.</BodyText>
      <BodyText>
        <strong>
          Please note that we do not use your first and last name anywhere on
          the site but it is stored. You will set a username after you sign up.
        </strong>
      </BodyText>
      <LoginForm
        onSuccess={() => {
          trackAction('Signup', 'Click sign-up button')
          push(routes.myAccount)
        }}
      />
      <BodyText>
        You can read our <Link to={routes.privacyPolicy}>Privacy Policy</Link>{' '}
        here.
      </BodyText>
    </>
  )
}
