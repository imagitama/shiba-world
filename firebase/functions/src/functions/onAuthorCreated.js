const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const { AuthorFieldNames, replaceReferencesWithString } = require('../firebase')
const { insertAuthorDocIntoIndex } = require('../algolia')

module.exports = functions.firestore
  .document('authors/{authorId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(
      'Created author',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      null,
      docData[AuthorFieldNames.createdBy]
    )

    return insertAuthorDocIntoIndex(doc, docData)
  })
