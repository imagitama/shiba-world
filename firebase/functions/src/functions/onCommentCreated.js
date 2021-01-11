const functions = require('firebase-functions')
const {
  isUserDocument,
  isPrivate,
  isNotApproved,
  isDeleted,
  isAdult,
  replaceReferencesWithString,
  AssetFieldNames,
  CommentFieldNames,
  UserFieldNames,
} = require('../firebase')
const {
  storeInNotifications,
  notifyTaggedUserIfNeeded,
} = require('../notifications')
const {
  emitToDiscordActivity,
  getEmbedForViewAsset,
  getEmbedForViewProfile,
} = require('../discord')
const { storeInHistory } = require('../history')

module.exports = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const parentDoc = await docData[CommentFieldNames.parent].get()
    const parentDocData = parentDoc.data()
    const originalAuthor = isUserDocument(parentDoc)
      ? docData[CommentFieldNames.parent]
      : parentDoc.get(AssetFieldNames.createdBy)

    await storeInNotifications(
      'Created comment',
      docData[CommentFieldNames.parent],
      originalAuthor,
      {
        author: docData[CommentFieldNames.createdBy],
      }
    )

    const commenterDoc = await docData[CommentFieldNames.createdBy].get()

    await notifyTaggedUserIfNeeded(
      docData[CommentFieldNames.comment],
      docData[CommentFieldNames.parent],
      docData[CommentFieldNames.createdBy]
    )

    if (isUserDocument(parentDoc)) {
      await emitToDiscordActivity(
        `User ${commenterDoc.get(
          UserFieldNames.username
        )} has commented on user profile for ${parentDoc.get(
          UserFieldNames.username
        )}`,
        [getEmbedForViewProfile(parentDoc.id)]
      )
    } else if (
      !isPrivate(parentDocData) &&
      !isNotApproved(parentDocData) &&
      !isDeleted(parentDocData) &&
      !isAdult(parentDocData)
    ) {
      await emitToDiscordActivity(
        `User ${commenterDoc.get(
          UserFieldNames.username
        )} has commented on asset "${parentDoc.get(AssetFieldNames.title)}"`,
        [getEmbedForViewAsset(parentDoc.id)]
      )
    }

    return storeInHistory(
      'Created comment',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
        parent: doc[CommentFieldNames.parent],
      },
      docData[CommentFieldNames.createdBy]
    )
  })
