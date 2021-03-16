const functions = require('firebase-functions')
const {
  CollectionNames,
  AssetAmendmentFieldNames,
  AssetFieldNames,
} = require('../firebase')
const {
  sendNotification,
  NotificationEvents,
  NotificationMethods,
} = require('../notifications')

const getEmailText = (title) => `Hello from VRCArena,

Somebody has amended your asset "${title}" with new tags. Please review the amendment.

Regards,

VRCArena`
const getEmailHtml = (title, id) => `Hello from VRCArena,
<br /><br />
Somebody has amended your asset <a href="${
  siteSettings.VRCARENA_BASE_URL
}${siteSettings.routes.viewAssetWithVar.replace(
  ':assetId',
  id
)}">${title}</a> with new tags. Please review the amendment.
<br /><br />
Regards,
<br /><br />
VRCArena`

module.exports = functions.firestore
  .document(`${CollectionNames.AssetAmendments}/{id}`)
  .onCreate(async (doc) => {
    const docData = doc.data()

    const creatorRef = docData[AssetAmendmentFieldNames.createdBy]

    const assetRef = docData[AssetAmendmentFieldNames.asset]
    const assetDoc = await assetRef.get()
    const assetOwnerRef =
      assetDoc.get(AssetFieldNames.ownedBy) ||
      assetDoc.get(AssetFieldNames.createdBy)

    await sendNotification(
      NotificationEvents.ASSET_AMENDED,
      assetRef,
      assetOwnerRef,
      {
        creator: creatorRef,
      },
      {
        [NotificationMethods.EMAIL]: {
          text: getEmailText(),
          html: getEmailHtml(),
        },
      }
    )
  })
