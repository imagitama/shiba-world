const functions = require('firebase-functions')
const { getTweetById } = require('../twitter')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new Error('Only logged in users can get tweet meta!')
    }

    const tweetId = data.tweetId

    if (!tweetId) {
      throw new Error(`Need a tweetId to proceed!`)
    }

    return getTweetById(tweetId, true)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
