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
    if (
      !after.get(AssetFieldNames.isApproved) ||
      after.get(AssetFieldNames.isDeleted) ||
      after.get(AssetFieldNames.isPrivate) ||
      after.get(AssetFieldNames.category) !== AssetCategories.content
    ) {
      return Promise.resolve()
    }

    return hydrateAssetOnContentChange(before, after)
  })
