const functions = require('firebase-functions')
const { pickFeaturedAsset } = require('../featuredAssets')

module.exports = functions.pubsub
  .schedule('0 0 * * *') // daily at midnight
  .onRun(async () => pickFeaturedAsset())
