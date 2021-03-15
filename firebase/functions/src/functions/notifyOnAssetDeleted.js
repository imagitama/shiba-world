const functions = require('firebase-functions')
const {
  CollectionNames,
  hasAssetJustBeenDeleted,
  AssetFieldNames,
} = require('../firebase')
const {
  sendNotification,
  NotificationEvents,
  NotificationMethods,
} = require('../notifications')
const siteSettings = require('../site')

const getEmailText = (title) => `Hello from VRCArena,

Your asset ${title} has been rejected or has been deleted. Please look at the comments for more information.

Regards,

VRCArena`
const getEmailHtml = (title, id) => `Hello from VRCArena,
<br /><br />
Your asset <a href="${
  siteSettings.VRCARENA_BASE_URL
}${siteSettings.routes.viewAssetWithVar.replace(
  ':assetId',
  id
)}">${title}</a> has been rejected or has been deleted. Please look at the comments for more information.
<br /><br />
Regards,
<br /><br />
VRCArena`

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    if (!hasAssetJustBeenDeleted(beforeDocData, docData)) {
      return
    }

    const recipientRef = doc.get(AssetFieldNames.createdAt)

    await sendNotification(
      NotificationEvents.ASSET_DELETED,
      doc.ref,
      recipientRef,
      null,
      {
        [NotificationMethods.EMAIL]: {
          text: getEmailText(),
          html: getEmailHtml(),
        },
      }
    )
  })
