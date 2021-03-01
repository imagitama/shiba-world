const functions = require('firebase-functions')
const {
  CollectionNames,
  AssetCategories,
  AssetFieldNames,
} = require('../firebase')
const { hydrateAssetOnContentChange } = require('../asset-meta')

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before, after }) => {
    if (after.get(AssetFieldNames.category) === AssetCategories.content) {
      return hydrateAssetOnContentChange(before, after)
    }
    return Promise.resolve()
  })
