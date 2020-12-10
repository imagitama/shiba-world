const functions = require('firebase-functions')
const { getUserStatusByUsername } = require('../vrchat')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    const username = data.username

    if (!username) {
      throw new Error('Need to pass username')
    }

    const result = await getUserStatusByUsername(username)

    return result
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-lookup-vrchat-username',
      err.message
    )
  }
})
