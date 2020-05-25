const functions = require('firebase-functions')
const admin = require('firebase-admin')
const algoliasearch = require('algoliasearch')
const diff = require('deep-diff')

const ALGOLIA_APP_ID = functions.config().algolia.app_id
const ALGOLIA_ADMIN_KEY = functions.config().algolia.admin_api_key

const ALGOLIA_INDEX_NAME = 'prod_ASSETS'
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)

admin.initializeApp()
const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

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

async function storeInHistory(message, parentRef, data) {
  return db.collection('history').add({
    message,
    parent: parentRef,
    data,
    createdAt: new Date(),
  })
}

function recursiveMap({ kind, path, lhs, rhs, item, index }) {
  const newItem = {
    kind,
    path,
    lhs,
    rhs,
    index,
  }

  // Firestore does not let us store as undefined so check for it
  if (item) {
    newItem.item = recursiveMap(item)
  }

  return newItem
}

function getDifferenceInObjects(objectA, objectB) {
  // Firestore does not support custom prototypes so just map into a basic thing
  return diff(objectA, objectB).map(recursiveMap)
}

exports.onAssetCreated = functions.firestore
  .document('assets/{assetId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(`Created asset`, doc.ref, {
      fields: docData,
    })

    if (isNotApproved(docData)) {
      return Promise.resolve()
    }

    await insertDocIntoIndex(doc, docData)
  })

exports.onAssetUpdated = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    await storeInHistory(`Edited asset`, doc.ref, {
      diff: getDifferenceInObjects(beforeDoc.data(), docData),
    })

    if (isNotApproved(docData)) {
      return Promise.resolve()
    }

    await insertDocIntoIndex(doc, docData)
  })

exports.onCommentCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(`Created comment`, doc.ref, {
      fields: docData,
    })
  })

exports.onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    await storeInHistory(`Edited user`, doc.ref, {
      diff: getDifferenceInObjects(beforeDoc.data(), docData),
    })
  })

exports.onUserSignup = functions.auth.user().onCreate(async (user) => {
  const { uid } = user

  const userRecord = db.collection('users').doc(uid)

  await userRecord.set({
    isAdmin: false,
    isEditor: false,
    username: '',
  })

  await storeInHistory(`User signup`, userRecord)
})
