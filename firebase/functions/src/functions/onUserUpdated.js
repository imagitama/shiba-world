const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const { UserFieldNames, replaceReferencesWithString } = require('../firebase')
const { insertUserDocIntoIndex } = require('../algolia')
const { getDifferenceInObjects } = require('../utils')

module.exports = functions.firestore
  .document('users/{userId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    await insertUserDocIntoIndex(doc, docData)

    return storeInHistory(
      'Edited user',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDoc.data()),
          replaceReferencesWithString(docData)
        ),
      },
      docData[UserFieldNames.lastModifiedBy]
    )
  })
