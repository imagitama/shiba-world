import React from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'
import firebase from 'firebase/app'
import { auth as authInstance } from '../../firebase'

export default ({ onSuccess }) => {
  const uiConfig = {
    signInFlow: 'popup',
    callbacks: {
      signInSuccessWithAuthResult: onSuccess
    },
    signInOptions: [
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID
    ],
    credentialHelper: 'none' // disable redirect on email login
  }

  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={authInstance} />
}
