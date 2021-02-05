import React from 'react'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'
import useQueryParams from '../../hooks/useQueryParams'

import LoginForm from '../../components/login-form'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import ErrorMessage from '../../components/error-message'
import LoginWithDiscord from '../../components/login-with-discord'

export default ({ history: { push } }) => {
  const [, , user] = useUserRecord()
  const queryParams = useQueryParams()

  if (user && !queryParams.get('code')) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  if (queryParams.get('code')) {
    return (
      <LoginWithDiscord
        code={queryParams.get('code')}
        onSuccess={() => push(routes.myAccount)}
        onFail={() => push(routes.login)}
      />
    )
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
      <BodyText>
        Reset your password <Link to={routes.resetPassword}>here</Link>.
      </BodyText>
    </>
  )
}
