const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { syncFeaturedAssets } = require('../featuredAssets')

module.exports = functions.firestore
  .document(`${CollectionNames.FeaturedAssetsForUsers}/{id}`)
  .onUpdate(async () => {
    await syncFeaturedAssets()
  })
