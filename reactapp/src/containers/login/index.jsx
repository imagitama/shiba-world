import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import * as routes from '../../routes'
import LoginForm from '../../components/login-form'
import withRedirectOnAuth from '../../hocs/withRedirectOnAuth'
import { trackAction, actions } from '../../analytics'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'

const Login = ({ push }) => (
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

export default connect(
  null,
  { push }
)(withRedirectOnAuth(Login))
