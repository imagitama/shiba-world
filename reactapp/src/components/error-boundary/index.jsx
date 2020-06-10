import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import ErrorMessage from '../error-message'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo)
    Sentry.captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorMessage>
          <p>
            <strong>Whoops. Something went wrong.</strong>
          </p>
          <p>
            Please try again. If it happens again please contact Peanut via
            Discord (Peanut#1756) or email (contact@vrcarena.com) and explain
            what you were doing so he can fix it.
          </p>
        </ErrorMessage>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
