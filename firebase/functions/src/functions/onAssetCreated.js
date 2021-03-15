const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const {
  replaceReferencesWithString,
  retrieveAuthorNameFromAssetData,
  isPrivate,
  isNotApproved,
  AssetFieldNames,
  UserFieldNames,
  isAdult,
} = require('../firebase')
const {
  emitToDiscordEditorNotifications,
  getEmbedForViewAsset,
} = require('../discord')
const { addTagsToCache } = require('../tags')
const { insertAssetDocIntoIndex } = require('../algolia')

module.exports = functions.firestore
  .document('assets/{assetId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(
      'Created asset',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData[AssetFieldNames.createdBy]
    )

    const authorName = await retrieveAuthorNameFromAssetData(
      docData,
      '(no author)'
    )

    if (isNotApproved(docData)) {
      if (!isPrivate(docData)) {
        const createdByDoc = await docData[AssetFieldNames.createdBy].get()

        await emitToDiscordEditorNotifications(
          `Created asset "${
            docData[AssetFieldNames.title]
          }" by ${authorName} (posted by ${createdByDoc.get(
            UserFieldNames.username
          )})`,
          [getEmbedForViewAsset(doc.id)]
        )
      }

      return Promise.resolve()
    }

    if (isPrivate(docData)) {
      return Promise.resolve()
    }

    if (!isAdult(docData)) {
      await addTagsToCache(docData[AssetFieldNames.tags])
    }

    return insertAssetDocIntoIndex(doc, docData)
  })
