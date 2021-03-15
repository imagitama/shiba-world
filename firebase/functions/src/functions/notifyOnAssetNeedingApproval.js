const functions = require('firebase-functions')
const {
  CollectionNames,
  AssetFieldNames,
  hasAssetJustBeenPublished,
} = require('../firebase')
const {
  NotificationEvents,
  NotificationMethods,
  sendNotificationToAllEditors,
} = require('../notifications')
const siteSettings = require('../site')

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()
    const doc = afterDoc

    console.log(
      'has asset been published?',
      beforeDocData[AssetFieldNames.isPrivate],
      afterDocData[AssetFieldNames.isPrivate]
    )

    if (!hasAssetJustBeenPublished(beforeDocData, afterDocData)) {
      return
    }

    const emailText = `Hi. The asset ${doc.get(
      AssetFieldNames.title
    )} with ID ${doc.id} has just been created and is waiting for approval :)`
    const emailHtml = `Hi. The asset <a href="${
      siteSettings.VRCARENA_BASE_URL
    }${siteSettings.routes.viewAssetWithVar.replace(':assetId', doc.id)}
    ">${doc.get(
      AssetFieldNames.title
    )}</a> has just been created and is waiting for approval :)`

    await sendNotificationToAllEditors(
      NotificationEvents.ASSET_NEEDS_APPROVAL,
      doc.ref,
      { asset: doc.data() },
      {
        [NotificationMethods.EMAIL]: {
          text: emailText,
          html: emailHtml,
        },
      }
    )
  })
