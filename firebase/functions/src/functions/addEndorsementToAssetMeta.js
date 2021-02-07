const functions = require('firebase-functions')
const { CollectionNames, EndorsementFieldNames } = require('../firebase')
const { addEndorsementToAssetMeta } = require('../asset-meta')

module.exports = functions.firestore
  .document(`${CollectionNames.Endorsements}/{id}`)
  .onCreate(async (doc) => {
    const assetId = doc.get(EndorsementFieldNames.asset).id
    await addEndorsementToAssetMeta(assetId)
  })
