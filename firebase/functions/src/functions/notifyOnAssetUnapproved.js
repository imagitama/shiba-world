const functions = require('firebase-functions')
const {
  CollectionNames,
  hasAssetJustBeenUnapproved,
  AssetFieldNames,
} = require('../firebase')
const {
  sendNotification,
  NotificationEvents,
  NotificationMethods,
} = require('../notifications')
const siteSettings = require('../site')

const getEmailText = (title) => `Hello from VRCArena,

Your asset "${title}" has not been approved and is now unpublished. It may need additional input from you.

Regards,

VRCArena`
const getEmailHtml = (title, id) => `Hello from VRCArena,
<br /><br />
Your asset <a href="${
  siteSettings.VRCARENA_BASE_URL
}${siteSettings.routes.viewAssetWithVar.replace(
  ':assetId',
  id
)}">${title}</a> has not been approved and is now unpublished. It may need additional input from you.
<br /><br />
Regards,
<br /><br />
VRCArena`

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()
    const doc = afterDoc

    if (!hasAssetJustBeenUnapproved(beforeDocData, afterDocData)) {
      return
    }

    const recipientRef = doc.get(AssetFieldNames.createdBy)

    await sendNotification(
      NotificationEvents.ASSET_UNAPPROVED,
      doc.ref,
      recipientRef,
      null,
      {
        [NotificationMethods.EMAIL]: {
          text: getEmailText(doc.get(AssetFieldNames.title)),
          html: getEmailHtml(doc.get(AssetFieldNames.title), doc.id),
        },
      }
    )
  })
