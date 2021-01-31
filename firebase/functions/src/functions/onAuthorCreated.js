const functions = require('firebase-functions')
const { storeInHistory } = require('../history')
const { AuthorFieldNames } = require('../firebase')
const { insertAuthorDocIntoIndex } = require('../algolia')

module.exports = functions.firestore
  .document('authors/{authorId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(
      'Created author',
      doc.ref,
      // commented out because error encoding field or something
      // {
      //   fields: replaceReferencesWithString(docData),
      // },
      null,
      docData[AuthorFieldNames.createdBy]
    )

    return insertAuthorDocIntoIndex(doc, docData)
  })
