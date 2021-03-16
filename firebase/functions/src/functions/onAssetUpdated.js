const functions = require('firebase-functions')
const { getDifferenceInObjects } = require('../utils')
const {
  replaceReferencesWithString,
  isPrivate,
  isDeleted,
  isAdult,
  retrieveAuthorNameFromAssetData,
  hasAssetJustBeenApproved,
  AssetFieldNames,
  UserFieldNames,
  isNotApproved,
} = require('../firebase')
const { deleteDocFromIndex, insertAssetDocIntoIndex } = require('../algolia')
const { storeInNotifications } = require('../notifications')
const { insertTweetRecordInDatabase } = require('../twitter')
const {
  emitToDiscordActivity,
  getEmbedForViewAsset,
  getUrlForViewAsset,
} = require('../discord')
const { addTagsToCache } = require('../tags')
const { storeInHistory } = require('../history')

module.exports = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    await storeInHistory(
      'Edited asset',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDocData),
          replaceReferencesWithString(docData)
        ),
      },
      docData[AssetFieldNames.lastModifiedBy]
    )

    // has become unapproved
    if (
      beforeDocData[AssetFieldNames.isApproved] === true &&
      docData[AssetFieldNames.isApproved] === false
    ) {
      await deleteDocFromIndex(doc)
    }

    if (isNotApproved(docData)) {
      return Promise.resolve()
    }

    // has become private TODO: Make a func
    if (
      beforeDocData[AssetFieldNames.isPrivate] !== true &&
      docData[AssetFieldNames.isPrivate] === true
    ) {
      return deleteDocFromIndex(doc)
    }

    // has become deleted TODO: make a func
    if (
      beforeDocData[AssetFieldNames.isDeleted] !== true &&
      docData[AssetFieldNames.isDeleted] === true
    ) {
      return deleteDocFromIndex(doc)
    }

    if (isPrivate(docData)) {
      return Promise.resolve()
    }

    if (isDeleted(docData)) {
      return Promise.resolve()
    }

    const authorName = await retrieveAuthorNameFromAssetData(
      docData,
      '(no author)'
    )

    if (hasAssetJustBeenApproved(beforeDocData, docData)) {
      if (!isAdult(docData)) {
        const createdByDoc = await docData.createdBy.get()

        await insertTweetRecordInDatabase(
          `"${docData.title}" by ${authorName} (posted by ${createdByDoc.get(
            UserFieldNames.username
          )}) ${getUrlForViewAsset(doc.id)}`
        )

        await emitToDiscordActivity(
          `Asset "${
            docData.title
          }" by ${authorName} (posted by ${createdByDoc.get(
            UserFieldNames.username
          )}) has been approved`,
          [getEmbedForViewAsset(doc.id)]
        )
      }
    } else if (!isAdult(docData)) {
      const editorDoc = await docData.lastModifiedBy.get()
      await emitToDiscordActivity(
        `Asset "${doc.get(
          AssetFieldNames.title
        )}" has been edited by ${editorDoc.get(UserFieldNames.username)}`,
        [getEmbedForViewAsset(doc.id)]
      )
    }

    if (!isAdult(docData)) {
      await addTagsToCache(docData[AssetFieldNames.tags])
    }

    return insertAssetDocIntoIndex(doc, docData)
  })
