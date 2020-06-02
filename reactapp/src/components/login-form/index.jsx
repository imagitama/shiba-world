import React from 'react'
import { withFirebase } from 'react-redux-firebase'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import { auth as firebaseAuth } from 'firebase/app'
import { auth as authInstance } from '../../firebase'

const LoginForm = ({ onSuccess }) => {
  const uiConfig = {
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: onSuccess
    },
    signInOptions: [
      firebaseAuth.EmailAuthProvider.PROVIDER_ID,
      firebaseAuth.GoogleAuthProvider.PROVIDER_ID,
      // firebaseAuth.FacebookAuthProvider.PROVIDER_ID
      firebaseAuth.TwitterAuthProvider.PROVIDER_ID
    ],
    credentialHelper: 'none' // disable redirect on email login
  }

  return (
    <>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={authInstance} />
    </>
  )
}

export default withFirebase(LoginForm)
