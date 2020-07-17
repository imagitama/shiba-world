import { inDevelopment } from './environment'

export const trackAction = (category, action, payload) => {
  if (inDevelopment()) {
    console.debug('trackAction', category, action, payload)
    return
  }

  window.gtag('event', action, {
    event_category: category,
    event_label: JSON.stringify(payload)
  })
}
