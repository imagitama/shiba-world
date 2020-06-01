import React from 'react'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import { trackAction, actions } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'

export default ({ history: { push } }) => {
  const [, , user] = useUserRecord()

  if (user) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Login</Heading>
      <BodyText>Enter your details below to login.</BodyText>
      <LoginForm
        onSuccess={auth => {
          trackAction(actions.LOGIN, {
            userId: auth.user ? auth.user.uid : 'unknown'
          })

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
