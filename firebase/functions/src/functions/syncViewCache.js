const functions = require('firebase-functions')
const { syncAllViewCaches } = require('../views')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await syncAllViewCaches()
    res.status(200).send('View caches have been synced')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
