const functions = require('firebase-functions')
const { pickFeaturedAsset } = require('../featuredAssets')

// module.exports = functions.pubsub
//   .schedule('0 0 * * *') // daily at midnight
//   .onRun(async () => pickFeaturedAsset())

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await pickFeaturedAsset()
    res.status(200).send('Featured asset picked')
  } catch (err) {
    console.error(err)
    res.status(500).send(`Error: ${err.message}`)
  }
})
