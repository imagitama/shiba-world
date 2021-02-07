const functions = require('firebase-functions')
const { CollectionNames } = require('../firebase')
const { hydrateAsset } = require('../asset-meta')

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before, after }) => hydrateAsset(before, after))
