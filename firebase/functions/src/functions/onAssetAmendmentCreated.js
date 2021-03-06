const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const {
  CollectionNames,
  replaceReferencesWithString,
  AssetAmendmentFieldNames,
  AssetFieldNames,
  UserFieldNames,
} = require('../firebase')
const {
  emitToDiscordEditorNotifications,
  getEmbedForViewAsset,
} = require('../discord')

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

    await emitToDiscordEditorNotifications(
      `User "${creatorUsername}" amended asset "${assetTitle}" with new tags`,
      [getEmbedForViewAsset(assetRef.id)]
    )
  })
