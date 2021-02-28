const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydrateAssetWithProductDoc } = require('../asset-meta')

// TODO: If changing asset we must "cleanup" the before asset!!!
module.exports = functions.firestore
  .document(`${CollectionNames.Products}/{id}`)
  .onUpdate(async ({ after }) => hydrateAssetWithProductDoc(after))
