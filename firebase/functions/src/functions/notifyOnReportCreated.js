const functions = require('firebase-functions')
const {
  CollectionNames,
  ReportFieldNames,
  AssetFieldNames,
} = require('../firebase')
const {
  sendNotificationToAllEditors,
  NotificationEvents,
  NotificationMethods,
} = require('../notifications')
const siteSettings = require('../site')

const getEmailText = (title) => `Hello from VRCArena,

Somebody has created a report for asset "${title}". Review active reports by going to the admin area: ${siteSettings.VRCARENA_BASE_URL}${siteSettings.routes.admin}

Regards,

VRCArena`
const getEmailHtml = (title) => `Hello from VRCArena,
<br /><br />
Somebody has created a report for asset "${title}". Review active reports by clicking <a href="${siteSettings.VRCARENA_BASE_URL}${siteSettings.routes.admin}">here</a>.
<br /><br />
Regards,
<br /><br />
VRCArena`

module.exports = functions.firestore
  .document(`${CollectionNames.Reports}/{id}`)
  .onCreate(async (doc) => {
    const docData = doc.data()

    // TODO: In future we will let users report ANYTHING!
    const assetRef = docData[ReportFieldNames.parent]
    const assetDoc = await assetRef.get()

    await sendNotificationToAllEditors(
      NotificationEvents.REPORT_CREATED,
      doc.ref,
      { asset: doc.data() },
      {
        [NotificationMethods.EMAIL]: {
          text: getEmailText(assetDoc.get(AssetFieldNames.title)),
          html: getEmailHtml(assetDoc.get(AssetFieldNames.title)),
        },
      }
    )
  })
