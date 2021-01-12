const functions = require('firebase-functions')
const { syncFeaturedAssets } = require('../featuredAssets')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await syncFeaturedAssets()
    res.status(200).send('Featured assets have been synced')
  } catch (err) {
    console.error(err)
    res.status(500).send(`Error: ${err.message}`)
  }
})
