const functions = require('firebase-functions')
const {
  CollectionNames,
  AssetFieldNames,
} = require('../firebase')
const {
  sendNotification,
  NotificationEvents,
  NotificationMethods,
} = require('../notifications')
const siteSettings = require('../site')

const getEmailText = (title) => `Hello from VRCArena,

You have been given ownership of the asset "${title}". You can now edit its details.

Regards,

VRCArena`
const getEmailHtml = (title, id) => `Hello from VRCArena,
<br /><br />
You have been given ownership of the asset <a href="${
  siteSettings.VRCARENA_BASE_URL
}${siteSettings.routes.viewAssetWithVar.replace(
  ':assetId',
  id
)}">${title}</a>. You can now edit its details.
<br /><br />
Regards,
<br /><br />
VRCArena`

const getHasOwnershipChanged = (beforeDocData, afterDocData) => {
  if (!beforeDocData[AssetFieldNames.ownedBy] && afterDocData[AssetFieldNames.ownedBy]) {
    return true
  }
  if (beforeDocData[AssetFieldNames.ownedBy] && afterDocData[AssetFieldNames.ownedBy] && beforeDocData[AssetFieldNames.ownedBy].id !== afterDocData[AssetFieldNames.ownedBy].id) {
    return true
  }
  return false
}

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()
    const doc = afterDoc

    if (!getHasOwnershipChanged(beforeDocData, afterDocData)) {
      return
    }

    const recipientRef = doc.get(AssetFieldNames.ownedBy)

    await sendNotification(
      NotificationEvents.ASSET_OWNERSHIP_CHANGED,
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
