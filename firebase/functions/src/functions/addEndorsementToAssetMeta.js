const functions = require('firebase-functions')
const {
  CollectionNames,
  EndorsementFieldNames,
  addEndorsementToAssetMeta,
} = require('../firebase')

module.exports = functions.firestore
  .document(`${CollectionNames.Endorsements}/{id}`)
  .onCreate(async (doc) => {
    const assetId = doc.get(EndorsementFieldNames.asset).id
    await addEndorsementToAssetMeta(assetId)
  })
