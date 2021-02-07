const functions = require('firebase-functions')
const { syncAllAssetMeta } = require('../asset-meta')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await syncAllAssetMeta()
    res.status(200).send('Asset meta has been synced')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
