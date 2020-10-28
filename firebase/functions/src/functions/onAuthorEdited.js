const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const { replaceReferencesWithString, AuthorFieldNames } = require('../firebase')
const { insertAuthorDocIntoIndex } = require('../algolia')
const { getDifferenceInObjects } = require('../utils')

module.exports = functions.firestore
  .document('authors/{authorId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    await storeInHistory(
      'Edited author',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDocData),
          replaceReferencesWithString(docData)
        ),
      },
      docData[AuthorFieldNames.lastModifiedBy]
    )

    return insertAuthorDocIntoIndex(doc, docData)
  })
