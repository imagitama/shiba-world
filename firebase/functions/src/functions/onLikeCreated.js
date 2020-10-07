const functions = require('firebase-functions')
const {
  isPrivate,
  isNotApproved,
  isDeleted,
  isAdult,
  replaceReferencesWithString,
  LikeFieldNames,
  CommentFieldNames,
  AssetFieldNames,
} = require('../firebase')
const { storeInHistory } = require('../history')
const { emitToDiscordActivity, getEmbedForViewAsset } = require('../discord')

module.exports = functions.firestore
  .document('likes/{likeId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const commentDoc = await docData[LikeFieldNames.parent].get()
    const commentDocData = commentDoc.data()
    const commenterDoc = await commentDocData[CommentFieldNames.createdBy].get()
    const assetDoc = await commentDocData[CommentFieldNames.parent].get()
    const likerDoc = await docData[LikeFieldNames.createdBy].get()

    if (
      !isPrivate(assetDoc) &&
      !isNotApproved(assetDoc) &&
      !isDeleted(assetDoc) &&
      !isAdult(assetDoc)
    ) {
      await emitToDiscordActivity(
        `User ${likerDoc.get(
          UserFieldNames.username
        )} liked a comment by "${commenterDoc.get(
          UserFieldNames.username
        )}" on asset "${assetDoc.get(AssetFieldNames.title)}"`,
        [getEmbedForViewAsset(assetDoc.id)]
      )
    }

    return storeInHistory(
      'Liked comment',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
        parent: doc[LikeFieldNames.parent],
      },
      docData[LikeFieldNames.createdBy]
    )
  })
