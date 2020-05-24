const functions = require('firebase-functions')
const admin = require('firebase-admin')
const algoliasearch = require('algoliasearch')

const ALGOLIA_APP_ID = functions.config().algolia.app_id
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_api_key

const ALGOLIA_INDEX_NAME = 'prod_ASSETS'
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)

admin.initializeApp()
const db = admin.firestore()

function convertDocToAlgoliaRecord(docId, doc) {
  return {
    objectID: docId,
    title: doc.title,
    description: doc.description,
    thumbnailUrl: doc.thumbnailUrl,
    isAdult: doc.isAdult,
    tags: doc.tags,
  }
}

function insertDocIntoIndex(doc, docData) {
  return client
    .initIndex(ALGOLIA_INDEX_NAME)
    .saveObject(convertDocToAlgoliaRecord(doc.id, docData))
}

function isNotApproved(docData) {
  return docData.isApproved === false
}

exports.onAssetCreated = functions.firestore
  .document('assets/{assetId}')
  .onCreate((doc) => {
    const docData = doc.data()
    if (isNotApproved(docData)) {
      return 0
    }
    return insertDocIntoIndex(doc, docData)
  })

exports.onAssetUpdated = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(({ after: doc }) => {
    const docData = doc.data()
    if (isNotApproved(docData)) {
      return 0
    }
    return insertDocIntoIndex(doc, docData)
  })

exports.onUserSignup = functions.auth.user().onCreate((user) => {
  const { uid } = user

  return db.collection('users').doc(uid).set({
    isAdmin: false,
    isEditor: false,
    username: '',
  })
})
