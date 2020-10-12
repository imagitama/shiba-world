const algoliasearch = require('algoliasearch')
const {
  AssetFieldNames,
  AuthorFieldNames,
  UserFieldNames,
  retrieveAuthorNameFromAssetData,
} = require('./firebase')
const config = require('./config')

const IS_ALGOLIA_ENABLED = config.global.isAlgoliaEnabled !== 'false'
const ALGOLIA_APP_ID = config.algolia.app_id
const ALGOLIA_ADMIN_KEY = config.algolia.admin_api_key
const ALGOLIA_INDEX_NAME_ASSETS = 'prod_ASSETS'
module.exports.ALGOLIA_INDEX_NAME_ASSETS = ALGOLIA_INDEX_NAME_ASSETS
const ALGOLIA_INDEX_NAME_USERS = 'prod_USERS'
module.exports.ALGOLIA_INDEX_NAME_USERS = ALGOLIA_INDEX_NAME_USERS
const ALGOLIA_INDEX_NAME_AUTHORS = 'prod_AUTHORS'
module.exports.ALGOLIA_INDEX_NAME_AUTHORS = ALGOLIA_INDEX_NAME_AUTHORS

let algoliaClient

const getAlgoliaClient = () => {
  if (algoliaClient) {
    return algoliaClient
  }

  algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
  return algoliaClient
}
module.exports.getAlgoliaClient = getAlgoliaClient

const convertAssetDocToAlgoliaRecord = (docId, doc, authorName) => {
  return {
    objectID: docId,
    title: doc[AssetFieldNames.title],
    description: doc[AssetFieldNames.description],
    thumbnailUrl: doc[AssetFieldNames.thumbnailUrl],
    isAdult: doc[AssetFieldNames.isAdult],
    tags: doc[AssetFieldNames.tags],
    species: doc[AssetFieldNames.species],
    category: doc[AssetFieldNames.category],
    authorName,
  }
}
module.exports.convertAssetDocToAlgoliaRecord = convertAssetDocToAlgoliaRecord

const convertAuthorDocToAlgoliaRecord = (docId, doc) => {
  return {
    objectID: docId,
    name: doc[AuthorFieldNames.name],
    description: doc[AuthorFieldNames.description],
    categories: doc[AuthorFieldNames.categories],
  }
}
module.exports.convertAuthorDocToAlgoliaRecord = convertAuthorDocToAlgoliaRecord

const convertUserDocToAlgoliaRecord = (docId, doc) => {
  return {
    objectID: docId,
    username: doc[UserFieldNames.username],
    avatarUrl: doc[UserFieldNames.avatarUrl],
  }
}
module.exports.convertUserDocToAlgoliaRecord = convertUserDocToAlgoliaRecord

module.exports.insertAssetDocIntoIndex = async (doc, docData) => {
  const authorName = await retrieveAuthorNameFromAssetData(docData)

  if (!IS_ALGOLIA_ENABLED) {
    return Promise.resolve()
  }

  return getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_ASSETS)
    .saveObject(convertAssetDocToAlgoliaRecord(doc.id, docData, authorName))
}

module.exports.insertAuthorDocIntoIndex = async (doc, docData) => {
  if (!IS_ALGOLIA_ENABLED) {
    return Promise.resolve()
  }

  return getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_AUTHORS)
    .saveObject(convertAuthorDocToAlgoliaRecord(doc.id, docData))
}

module.exports.insertUserDocIntoIndex = async (doc, docData) => {
  if (!IS_ALGOLIA_ENABLED) {
    return Promise.resolve()
  }

  return getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_USERS)
    .saveObject(convertUserDocToAlgoliaRecord(doc.id, docData))
}

module.exports.deleteDocFromIndex = async (doc) => {
  if (!IS_ALGOLIA_ENABLED) {
    return Promise.resolve()
  }

  return getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME_ASSETS)
    .deleteObject(doc.id)
}
