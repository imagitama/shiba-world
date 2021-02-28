const functions = require('firebase-functions')
const { handleWebhook } = require('../transactions')

module.exports = functions.https.onRequest(async (request) => {
  try {
    if (request.method !== 'POST') {
      throw new Error(`Cannot handle webhook: invalid method ${request.method}`)
    }

    await handleWebhook(request.body)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
