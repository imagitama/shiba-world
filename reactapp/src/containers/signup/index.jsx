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
    <Heading variant="h1">Sign Up</Heading>
    <BodyText>Enter your details below to create a new account.</BodyText>
    <BodyText>
      <strong>
        Please note that we do not use your first and last name anywhere on the
        site but it is stored. You will set a username after you sign up.
      </strong>
    </BodyText>
    <LoginForm
      onSuccess={auth => {
        trackAction(actions.SIGNUP, {
          userId: auth.user ? auth.user.uid : 'unknown'
        })

        push(routes.myAccount)
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
