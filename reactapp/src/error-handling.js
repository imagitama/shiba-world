import * as Sentry from '@sentry/browser'

export function handleError(err) {
  Sentry.captureException(err)
}
