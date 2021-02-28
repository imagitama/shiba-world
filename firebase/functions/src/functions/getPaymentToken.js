const functions = require('firebase-functions')
const { getToken } = require('../transactions')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new Error('Only logged in users can get payment tokens!')
    }

    const token = await getToken()

    return { token }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
