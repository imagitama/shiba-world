import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/database'
import 'firebase/functions'
import * as Sentry from '@sentry/browser'

import { inDevelopment } from './environment'

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
}

export const firebaseApp = firebase.initializeApp(firebaseConfig)

if (
  process.env.REACT_APP_USE_EMULATORS ||
  process.env.REACT_APP_USE_FUNCTIONS_EMULATOR
) {
  console.debug(`using functions emulator`)
  firebase.functions().useFunctionsEmulator('http://localhost:5001')
}

if (
  process.env.REACT_APP_USE_EMULATORS ||
  process.env.REACT_APP_USE_FIRESTORE_EMULATOR
) {
  console.debug(`using firestore emulator`)
  firebase.firestore().useEmulator('localhost', 8081)
}

if (
  process.env.REACT_APP_USE_EMULATORS ||
  process.env.REACT_APP_USE_AUTH_EMULATOR
) {
  console.debug(`using auth emulator`)
  firebase.auth().useEmulator('http://localhost:9099')
}

export const auth = firebaseApp.auth()

export const logout = () => auth.signOut()

export const roles = {
  ADMIN: 'ADMIN'
}

export let loggedInUserId = null

auth.onAuthStateChanged(user => {
  if (user) {
    loggedInUserId = user

    Sentry.setUser({
      id: user.uid,
      username: user.displayName,
      email: user.email
    })
  } else {
    Sentry.setUser({
      id: null,
      username: null,
      email: null
    })

    loggedInUserId = null
  }
})

export const callFunction = (name, data, inDevResult) => {
  if (inDevelopment() && inDevResult) {
    return Promise.resolve(inDevResult)
  }

  return firebase
    .app()
    .functions()
    .httpsCallable(name)(data)
}
