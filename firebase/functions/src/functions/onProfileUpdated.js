const functions = require('firebase-functions')
const { getDifferenceInObjects } = require('../utils')
const {
  replaceReferencesWithString,
  ProfileFieldNames,
} = require('../firebase')
const { storeInHistory } = require('../history')

module.exports = functions.firestore
  .document('profiles/{userId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    return storeInHistory(
      'Edited profile',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDoc.data()),
          replaceReferencesWithString(docData)
        ),
      },
      docData[ProfileFieldNames.lastModifiedBy]
    )
  })
