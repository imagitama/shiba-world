const functions = require('firebase-functions')
const {
  replaceReferencesWithString,
  UserFieldNames,
  RequestsFieldNames,
} = require('../firebase')
const { storeInHistory } = require('../history')
const { emitToDiscordActivity, getEmbedForViewRequest } = require('../discord')

module.exports = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const creatorDoc = await docData[RequestsFieldNames.createdBy].get()

    await emitToDiscordActivity(
      `${creatorDoc.get(UserFieldNames.username)} created request "${doc.get(
        RequestsFieldNames.title
      )}"`,
      [getEmbedForViewRequest(doc.id)]
    )

    return storeInHistory(
      'Created request',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData.createdBy
    )
  })
