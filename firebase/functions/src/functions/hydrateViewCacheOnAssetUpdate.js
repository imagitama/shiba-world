const functions = require('firebase-functions')
const { CollectionNames, AssetFieldNames } = require('../firebase')
const { hydrate } = require('../views/view-category')

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ after }) =>
    // TODO: if you switch categories then it will show in 2 different categories!
    hydrate(after.get(AssetFieldNames.category), after)
  )
