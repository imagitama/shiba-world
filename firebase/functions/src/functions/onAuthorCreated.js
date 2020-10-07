const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const { replaceReferencesWithString, AuthorFieldNames } = require('../firebase')
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
      docData[AuthorFieldNames.createdBy]
    )

    return insertAuthorDocIntoIndex(doc, docData)
  })
