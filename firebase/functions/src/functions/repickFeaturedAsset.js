const functions = require('firebase-functions')
const { pickFeaturedAsset } = require('../featuredAssets')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await pickFeaturedAsset()
    res.status(200).send('Featured asset has been repicked')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
