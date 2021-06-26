import React, { Component } from 'react'
import * as Sentry from '@sentry/browser'
import ErrorMessage from '../error-message'
import { DISCORD_URL, EMAIL } from '../../config'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Do regular .log() here just in case .error() triggers Sentry twice
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
            This doesn't usually happen. Please{' '}
            <a href={DISCORD_URL}>join our Discord</a> or{' '}
            <a href={`mailto:${EMAIL}`}>email us</a> to report this error so we
            can fix it.
          </p>
        </ErrorMessage>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
