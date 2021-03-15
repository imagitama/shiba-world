const functions = require('firebase-functions')
const {
  isUserDocument,
  AssetFieldNames,
  CommentFieldNames,
} = require('../firebase')
const {
  sendNotification,
  NotificationEvents,
  NotificationMethods,
  notifyTaggedUserIfNeeded,
} = require('../notifications')
const siteSettings = require('../site')

module.exports = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const parentDoc = await docData[CommentFieldNames.parent].get()
    const hasCommentedOnUser = isUserDocument(parentDoc)
    const originalAuthor = hasCommentedOnUser
      ? docData[CommentFieldNames.parent]
      : parentDoc.get(AssetFieldNames.createdBy)

    const emailText = `Hello from VRCArena,
      
Somebody has commented on your ${hasCommentedOnUser ? 'profile' : 'asset'}.

Regards,

VRCArena`

    const emailHtml = `Hello from VRCArena,
<br /><br />
Somebody has commented on your ${
      hasCommentedOnUser
        ? `<a href="${
            siteSettings.VRCARENA_BASE_URL
          }${siteSettings.routes.viewUserWithVar.replace(
            ':userId',
            originalAuthor.id
          )}">profile</a>`
        : `<a href="${
            siteSettings.VRCARENA_BASE_URL
          }${siteSettings.routes.viewAssetWithVar.replace(
            ':assetId',
            docData[CommentFieldNames.parent].id
          )}">asset</a>`
    }.
<br /><br />
Regards,
<br /><br />
VRCArena`

    await sendNotification(
      hasCommentedOnUser
        ? NotificationEvents.COMMENT_ON_USER
        : NotificationEvents.COMMENT_ON_ASSET,
      docData[CommentFieldNames.parent],
      originalAuthor,
      {
        author: docData[CommentFieldNames.createdBy],
      },
      {
        [NotificationMethods.EMAIL]: {
          text: emailText,
          html: emailHtml,
        },
      }
    )

    await notifyTaggedUserIfNeeded(
      docData[CommentFieldNames.comment],
      docData[CommentFieldNames.parent],
      docData[CommentFieldNames.createdBy]
    )
  })
