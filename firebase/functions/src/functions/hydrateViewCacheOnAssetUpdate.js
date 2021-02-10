const functions = require('firebase-functions')
const { CollectionNames, AssetFieldNames } = require('../firebase')
const { hydrateViewCache } = require('../view-cache')

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ after }) =>
    hydrateViewCache(`category-${after.get(AssetFieldNames.category)}`, after)
  )
