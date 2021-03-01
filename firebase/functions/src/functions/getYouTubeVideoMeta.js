const functions = require('firebase-functions')
const { getVideoById } = require('../youtube')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new Error('Only logged in users can get youtube video meta!')
    }

    const videoId = data.videoId

    if (!videoId) {
      throw new Error(`Need a videoId to proceed!`)
    }

    return getVideoById(videoId)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
