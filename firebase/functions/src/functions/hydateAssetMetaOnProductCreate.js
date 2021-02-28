const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydrateAssetWithProductDoc } = require('../asset-meta')

module.exports = functions.firestore
  .document(`${CollectionNames.Products}/{id}`)
  .onCreate(async (doc) => hydrateAssetWithProductDoc(doc))
