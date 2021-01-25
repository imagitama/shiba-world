const functions = require('firebase-functions')
const { syncFeaturedAssets } = require('../featuredAssets')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await syncFeaturedAssets()
    res.status(200).send('Featured assets have been synced')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-sync-featured-assets',
      err.message
    )
  }
})
