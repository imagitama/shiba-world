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
          Something went wrong. Refresh the page to try again
        </ErrorMessage>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
