const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydrateAsset } = require('../asset-meta')

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onCreate(async (doc) => hydrateAsset(false, doc))
