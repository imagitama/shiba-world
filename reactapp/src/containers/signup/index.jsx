import React from 'react'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'
import Message, { types } from '../../components/message'

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
      <br />
      <br />
      <Message type={types.WARNING}>
        We are aware of issues where creating your profile after your sign up
        doesn't work. Please report this to #bugs in our Discord server and try
        an alternative way to sign up.
      </Message>
      <br />
      <br />
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
