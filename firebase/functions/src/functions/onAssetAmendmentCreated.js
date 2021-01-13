const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const {
  CollectionNames,
  replaceReferencesWithString,
  AssetAmendmentFieldNames,
  AssetFieldNames,
  UserFieldNames,
} = require('../firebase')
const { storeInNotifications } = require('../notifications')

module.exports = functions.firestore
  .document(`${CollectionNames.AssetAmendments}/{id}`)
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(
      'Created asset amendment',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData[AssetAmendmentFieldNames.createdBy]
    )

    const creatorRef = docData[AssetAmendmentFieldNames.createdBy]
    const creatorDoc = await creatorRef.get()
    const creatorUsername = creatorDoc.get(UserFieldNames.username)

    const assetRef = docData[AssetAmendmentFieldNames.asset]
    const assetDoc = await assetRef.get()
    const assetTitle = assetDoc.get(AssetFieldNames.title)
    const assetOwnerRef =
      assetDoc.get(AssetFieldNames.ownedBy) ||
      assetDoc.get(AssetFieldNames.createdBy)

    await storeInNotifications(
      `User "${creatorUsername}" has created an amendment for your asset "${assetTitle}"`,
      assetRef,
      assetOwnerRef
    )
  })
