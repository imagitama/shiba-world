import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import firebase from 'firebase/app'
import * as Sentry from '@sentry/browser'
import { createMuiTheme } from '@material-ui/core/styles'
import ThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import { loggedInUserId } from './firebase'
import ReactReduxFirebaseProvider from 'react-redux-firebase/lib/ReactReduxFirebaseProvider'
import store, { history } from './store'
import App from './App'
import { trackAction, actions } from './analytics'
import { inDevelopment } from './environment'
import { changeSearchTerm } from './modules/app'

import 'sanitize.css/sanitize.css'
import './assets/css/theme.css'
import './assets/css/mana.min.css'

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

const target = document.querySelector('#root')

const rrfProps = {
  firebase,
  config: {},
  dispatch: store.dispatch
}

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#875DC6',
      main: '#6e4a9e',
      dark: '#49326B'
    },
    secondary: {
      light: '#5C1B96',
      main: '#461470',
      dark: '#240b36'
    }
  }
})

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ReactReduxFirebaseProvider {...rrfProps}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </ReactReduxFirebaseProvider>
    </ConnectedRouter>
  </Provider>,
  target
)
