const functions = require('firebase-functions')
const {
  db,
  CollectionNames,
  AssetFieldNames,
  retrieveAuthorNameFromAssetData,
} = require('../firebase')
const {
  convertAssetDocToAlgoliaRecord,
  convertAuthorDocToAlgoliaRecord,
  convertUserDocToAlgoliaRecord,
} = require('../algolia')

async function insertAssetsIntoIndex() {
  const { docs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
    .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
    .get()

  const algoliaObjects = await Promise.all(
    docs.map(async (doc) => {
      const docData = doc.data()
      const authorName = await retrieveAuthorNameFromAssetData(docData)
      return convertAssetDocToAlgoliaRecord(doc.id, docData, authorName)
    })
  )

  await getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_ASSETS)
    .saveObjects(algoliaObjects)
}

async function insertAuthorsIntoIndex() {
  const { docs } = await db.collection(CollectionNames.Authors).get()

  const algoliaObjects = await Promise.all(
    docs.map(async (doc) => {
      const docData = doc.data()
      return convertAuthorDocToAlgoliaRecord(doc.id, docData)
    })
  )

  await getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_AUTHORS)
    .saveObjects(algoliaObjects)
}

async function insertUsersIntoIndex() {
  const { docs } = await db.collection(CollectionNames.Users).get()

  const algoliaObjects = await Promise.all(
    docs.map(async (doc) => {
      const docData = doc.data()
      return convertUserDocToAlgoliaRecord(doc.id, docData)
    })
  )

  await getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_USERS)
    .saveObjects(algoliaObjects)
}

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await insertAssetsIntoIndex()
    await insertAuthorsIntoIndex()
    await insertUsersIntoIndex()
    res.status(200).send('Index has been synced')
  } catch (err) {
    console.error(err)
    res.status(500).send(`Error: ${err.message}`)
  }
})
