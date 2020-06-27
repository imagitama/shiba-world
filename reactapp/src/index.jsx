import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import firebase from 'firebase/app'
import * as Sentry from '@sentry/browser'
import { loggedInUserId } from './firebase'
import ReactReduxFirebaseProvider from 'react-redux-firebase/lib/ReactReduxFirebaseProvider'
import store, { history } from './store'
import App from './App'
import { trackAction, actions } from './analytics'
import { inDevelopment } from './environment'
import { changeSearchTerm, setDarkModeEnabled } from './modules/app'

if (!inDevelopment()) {
  Sentry.init({
    dsn:
      'https://29d780084dd844fa9884a8b3ac50fc1e@o247075.ingest.sentry.io/5249930'
  })
}

history.listen(location => {
  trackAction(actions.NAVIGATE, {
    location,
    userId: loggedInUserId ? loggedInUserId.uid : null
  })

  store.dispatch(changeSearchTerm())
})

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', e => {
    store.dispatch(setDarkModeEnabled(e.matches))
  })

const target = document.querySelector('#root')

const rrfProps = {
  firebase,
  config: {},
  dispatch: store.dispatch
}

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <App />
      </ReactReduxFirebaseProvider>
    </ConnectedRouter>
  </Provider>,
  target
)
