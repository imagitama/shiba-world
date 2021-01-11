const functions = require('firebase-functions')
const { replaceReferencesWithString } = require('../firebase')
const { getDifferenceInObjects } = require('../utils')
const { storeInHistory } = require('../history')

module.exports = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    await storeInHistory(
      'Edited request',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDocData),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )
  })
