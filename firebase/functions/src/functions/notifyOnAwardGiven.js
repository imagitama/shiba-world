const functions = require('firebase-functions')
const { CollectionNames, db, AwardsForUsersFieldNames } = require('../firebase')
const {
  NotificationEvents,
  NotificationMethods,
  sendNotification,
} = require('../notifications')
const siteSettings = require('../site')
const { getNewAwardIds, getNameForAwardId } = require('../awards')

module.exports = functions.firestore
  .document(`${CollectionNames.AwardsForUsers}/{id}`)
  .onWrite(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()
    const userId = afterDoc.id
    const newAwardIds = getNewAwardIds(
      beforeDocData[AwardsForUsersFieldNames.awards] || [],
      afterDocData[AwardsForUsersFieldNames.awards] || []
    )

    if (!newAwardIds.length) {
      console.warn(
        `Cannot notify on new awards - found none! Ignoring! ${JSON.stringify(
          afterDocData[AwardsForUsersFieldNames.awards]
        )}`
      )
      return
    }

    for (const newAwardId of newAwardIds) {
      const emailText = `Congratulations! You have just received the award "${getNameForAwardId(
        newAwardId
      )}"! View your profile (${
        siteSettings.VRCARENA_BASE_URL
      }${siteSettings.routes.viewUserWithVar.replace(
        ':userId',
        userId
      )}) to view all of your awards.`
      const emailHtml = `Congratulations! You have just received the award "${getNameForAwardId(
        newAwardId
      )}"! View <a href="${
        siteSettings.VRCARENA_BASE_URL
      }${siteSettings.routes.viewUserWithVar.replace(
        ':userId',
        userId
      )}}">your profile</a> to view all of your awards.`

      await sendNotification(
        NotificationEvents.AWARD_GIVEN,
        afterDoc.ref,
        db.collection(CollectionNames.Users).doc(afterDoc.id),
        {
          awardId: newAwardId,
        },
        {
          [NotificationMethods.EMAIL]: {
            text: emailText,
            html: emailHtml,
          },
        }
      )
    }
  })
