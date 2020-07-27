const functions = require('firebase-functions')
const admin = require('firebase-admin')
const algoliasearch = require('algoliasearch')
const diff = require('deep-diff')
const Twit = require('twit')
const fetch = require('node-fetch')

const config = functions.config()

// ALGOLIA

const ALGOLIA_APP_ID = config.algolia.app_id
const ALGOLIA_ADMIN_KEY = config.algolia.admin_api_key
const ALGOLIA_INDEX_NAME = 'prod_ASSETS'

let algoliaClient

function getAlgoliaClient() {
  if (algoliaClient) {
    return algoliaClient
  }

  algoliaClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY)
  return algoliaClient
}

function convertDocToAlgoliaRecord(docId, doc) {
  return {
    objectID: docId,
    title: doc[AssetFieldNames.title],
    description: doc[AssetFieldNames.description],
    thumbnailUrl: doc[AssetFieldNames.thumbnailUrl],
    authorName: doc[AssetFieldNames.authorName],
    isAdult: doc[AssetFieldNames.isAdult],
    tags: doc[AssetFieldNames.tags],
  }
}

function insertDocIntoIndex(doc, docData) {
  return getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME)
    .saveObject(convertDocToAlgoliaRecord(doc.id, docData))
}

function deleteDocFromIndex(doc) {
  return getAlgoliaClient().initIndex(ALGOLIA_INDEX_NAME).deleteObject(doc.id)
}

// FIREBASE

admin.initializeApp()
const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

const Operators = {
  EQUALS: '==',
  GREATER_THAN: '>',
  ARRAY_CONTAINS: 'array-contains',
}

const CollectionNames = {
  Users: 'users',
  Assets: 'assets',
  Comments: 'comments',
  Notices: 'notices',
  History: 'history',
  Endorsements: 'endorsements',
  Profiles: 'profiles',
  Mail: 'mail',
  Summaries: 'summaries',
  Tweets: 'tweets',
  Notifications: 'notifications',
}

const AssetFieldNames = {
  title: 'title',
  isAdult: 'isAdult',
  isApproved: 'isApproved',
  tags: 'tags',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  category: 'category',
  species: 'species',
  sourceUrl: 'sourceUrl',
  videoUrl: 'videoUrl',
  isPrivate: 'isPrivate',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  thumbnailUrl: 'thumbnailUrl',
  fileUrls: 'fileUrls',
  description: 'description',
  authorName: 'authorName',
  children: 'children',
}

const CommentFieldNames = {
  parent: 'parent',
  createdBy: 'createdBy',
}

const ProfileFieldNames = {
  vrchatUsername: 'vrchatUsername',
  discordUsername: 'discordUsername',
  twitterUsername: 'twitterUsername',
  telegramUsername: 'telegramUsername',
  youtubeChannelId: 'youtubeChannelId',
  twitchUsername: 'twitchUsername',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  bio: 'bio',
  notifyOnUnapprovedAssets: 'notifyOnUnapprovedAssets',
  notificationEmail: 'notificationEmail',
}

const UserFieldNames = {
  username: 'username',
  isEditor: 'isEditor',
  isAdmin: 'isAdmin',
  enabledAdultContent: 'enabledAdultContent',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
}

const NotificationsFieldNames = {
  recipient: 'recipient',
  message: 'message',
  parent: 'parent',
  isRead: 'isRead',
  data: 'data',
  createdAt: 'createdAt',
}

const RequestsFieldNames = {
  title: 'title',
  description: 'description',
  isClosed: 'isClosed',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  isDeleted: 'isDeleted',
}

function isNotApproved(docData) {
  return docData.isApproved === false
}

function isDeleted(docData) {
  return docData.isDeleted === true
}

function isPrivate(docData) {
  return docData.isPrivate === true
}

function isAdult(docData) {
  return docData[AssetFieldNames.isAdult] === true
}

function hasAssetJustBeenApproved(beforeDocData, afterDocData) {
  return (
    beforeDocData[AssetFieldNames.isApproved] !== true &&
    afterDocData[AssetFieldNames.isApproved] === true
  )
}

async function storeInHistory(message, parentRef, data, user) {
  return db.collection(CollectionNames.History).add({
    message,
    parent: parentRef,
    data,
    createdAt: new Date(),
    createdBy: user,
  })
}

async function storeInNotifications(
  message,
  parentRef,
  recipientRef,
  data = null
) {
  return db.collection(CollectionNames.Notifications).add({
    [NotificationsFieldNames.message]: message,
    [NotificationsFieldNames.parent]: parentRef,
    [NotificationsFieldNames.recipient]: recipientRef,
    [NotificationsFieldNames.isRead]: false,
    [NotificationsFieldNames.data]: data,
    [NotificationsFieldNames.createdAt]: new Date(),
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

function replaceReferenceWithString(ref) {
  return ref.path
}

function secondsToDate(seconds) {
  return new Date(seconds * 1000)
}

function replaceReferencesWithString(object) {
  const newObject = {}

  for (const key in object) {
    const val = object[key]

    if (typeof val === 'object' && val.id) {
      newObject[key] = replaceReferenceWithString(val)
    } else if (val.hasOwnProperty('_seconds')) {
      const newVal = secondsToDate(val._seconds)
      newObject[key] = newVal.toString()
    } else {
      newObject[key] = val
    }
  }

  return newObject
}

async function notifyUsersOfUnapprovedAsset(assetId, assetData) {
  const { docs: editorUsers } = await db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.isEditor, '==', true)
    .get()

  let recipientEmails = []

  /* eslint-disable no-await-in-loop */
  for (user of editorUsers) {
    // Awaiting like this will cause a bottleneck with a lot of results as it does it in sequence
    const profileDoc = await db
      .collection(CollectionNames.Profiles)
      .doc(user.id)
      .get()
    const profileData = profileDoc.data()

    if (profileData[ProfileFieldNames.notificationEmail]) {
      recipientEmails.push(profileData[ProfileFieldNames.notificationEmail])
      continue
    }

    if (profileData[ProfileFieldNames.notifyOnUnapprovedAssets]) {
      const authUser = await admin.auth().getUser(user.id)
      recipientEmails.push(authUser.email)
    }
  }

  if (!recipientEmails.length) {
    return Promise.resolve()
  }

  const emailText = `Hi. The asset ${assetData.title} with ID ${assetId} has just been created and is waiting for approval :)`

  return db.collection(CollectionNames.Mail).add({
    // BCC = blind carbon copy = others cant see it
    bcc: recipientEmails,
    message: {
      subject: 'New unapproved asset at VRCArena',
      text: emailText,
      html: emailText,
    },
  })
}

async function getAllTags() {
  const { docs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.isAdult, '==', false)
    .where(AssetFieldNames.isApproved, '==', true)
    .where(AssetFieldNames.isPrivate, '==', false)
    .where(AssetFieldNames.isDeleted, '==', false)
    .get()

  return docs.reduce((allTags, doc) => {
    const tags = doc.get(AssetFieldNames.tags)
    if (!tags) {
      return allTags
    }
    return allTags.concat(tags)
  }, [])
}

async function addTagsToCache(tags) {
  if (!tags) {
    return
  }

  const tagsDoc = await db.collection(CollectionNames.Summaries).doc('tags')
  const tagsRecord = await tagsDoc.get()
  let allTags = []
  const knownTags = tagsRecord.get('allTags')

  if (knownTags) {
    allTags = knownTags.concat(tags)
  } else {
    allTags = await getAllTags()
  }

  const allTagsWithoutDupes = allTags.filter(
    (tag, idx) => allTags.indexOf(tag) === idx
  )

  return tagsDoc.set({
    allTags: allTagsWithoutDupes,
  })
}

// TWITTER

const TWITTER_CONSUMER_KEY = config.twitter.consumer_key
const TWITTER_CONSUMER_SECRET = config.twitter.consumer_secret
const TWITTER_ACCESS_TOKEN_KEY = config.twitter.access_token_key
const TWITTER_ACCESS_TOKEN_SECRET = config.twitter.access_token_secret
let twitterClient

function getTwitterClient() {
  if (twitterClient) {
    return twitterClient
  }

  twitterClient = new Twit({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token: TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  })
  return twitterClient
}

async function sendTweet(status) {
  return getTwitterClient()
    .post('statuses/update', {
      status,
    })
    .then(({ data }) => data.id)
}

async function insertTweetRecordInDatabase(status) {
  return db.collection(CollectionNames.Tweets).add({
    status,
    createdAt: new Date(),
  })
}

async function updateTweetRecordInDatabase(recordId, tweetId) {
  return db.collection(CollectionNames.Tweets).doc(recordId).update({
    tweetId,
    tweetedAt: new Date(),
  })
}

// DISCORD

const DISCORD_ACTIVITY_WEBHOOK_URL = config.discord.activity_webhook_url
const DISCORD_EDITOR_NOTIFICATIONS_WEBHOOK_URL =
  config.discord.editor_notifications_webhook_url

const VRCARENA_BASE_URL = 'https://www.vrcarena.com'
const routes = {
  viewAssetWithVar: '/assets/:assetId',
  viewRequestWithVar: '/requests/:requestId',
  viewUserWithVar: '/users/:userId',
}

async function emitToDiscord(webhookUrl, message, embeds = []) {
  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message,
      embeds,
    }),
  })

  if (!resp.ok) {
    throw new Error(`Response not OK! ${resp.status} ${resp.statusText}`)
  }
}

async function emitToDiscordActivity(message, embeds) {
  return emitToDiscord(DISCORD_ACTIVITY_WEBHOOK_URL, message, embeds)
}

async function emitToDiscordEditorNotifications(message, embeds) {
  return emitToDiscord(
    DISCORD_EDITOR_NOTIFICATIONS_WEBHOOK_URL,
    message,
    embeds
  )
}

function getUrlForViewAsset(assetId) {
  return `${VRCARENA_BASE_URL}${routes.viewAssetWithVar.replace(
    ':assetId',
    assetId
  )}`
}

function getEmbedForViewAsset(assetId) {
  return {
    title: 'View Asset',
    url: getUrlForViewAsset(assetId),
  }
}

function getEmbedForViewProfile(userId) {
  return {
    title: 'View Profile',
    url: `${VRCARENA_BASE_URL}${routes.viewUserWithVar.replace(
      ':userId',
      userId
    )}`,
  }
}

function getEmbedForViewRequest(requestId) {
  return {
    title: 'View Request',
    url: `${VRCARENA_BASE_URL}${routes.viewRequestWithVar.replace(
      ':requestId',
      requestId
    )}`,
  }
}

exports.onAssetCreated = functions.firestore
  .document('assets/{assetId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    await storeInHistory(
      'Created asset',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData.createdBy
    )

    if (isNotApproved(docData)) {
      await notifyUsersOfUnapprovedAsset(doc.id, docData)

      if (!isPrivate(docData)) {
        const author = await docData[AssetFieldNames.createdBy].get()

        await emitToDiscordEditorNotifications(
          `Created asset "${docData[AssetFieldNames.title]}" by ${author.get(
            UserFieldNames.username
          )}`,
          [getEmbedForViewAsset(doc.id)]
        )
      }

      return Promise.resolve()
    }

    if (isPrivate(docData)) {
      return Promise.resolve()
    }

    await addTagsToCache(docData.tags)

    return insertDocIntoIndex(doc, docData)
  })

exports.onAssetUpdated = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    await storeInHistory(
      'Edited asset',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDocData),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )

    if (isNotApproved(docData)) {
      return Promise.resolve()
    }

    // has become private TODO: Make a func
    if (beforeDocData.isPrivate !== true && docData.isPrivate === true) {
      return deleteDocFromIndex(doc)
    }

    // has become deleted TODO: make a func
    if (beforeDocData.isDeleted !== true && docData.isDeleted === true) {
      return deleteDocFromIndex(doc)
    }

    if (isPrivate(docData)) {
      return Promise.resolve()
    }

    if (isDeleted(docData)) {
      return Promise.resolve()
    }

    if (hasAssetJustBeenApproved(beforeDocData, docData)) {
      await storeInNotifications(
        'Approved asset',
        beforeDoc.ref,
        docData.createdBy
      )

      if (!isAdult(docData)) {
        const author = await docData.createdBy.get()

        await insertTweetRecordInDatabase(
          `"${docData.title}" posted by ${author.get(
            UserFieldNames.username
          )} ${getUrlForViewAsset(doc.id)}`
        )

        await emitToDiscordActivity(
          `Asset "${docData.title}" posted by ${author.get(
            UserFieldNames.username
          )} has been approved`,
          [getEmbedForViewAsset(doc.id)]
        )
      }
    } else {
      const editorDoc = await docData.lastModifiedBy.get()
      await emitToDiscordActivity(
        `Asset "${doc.get(
          AssetFieldNames.title
        )}" has been edited by ${editorDoc.get(UserFieldNames.username)}`,
        [getEmbedForViewAsset(doc.id)]
      )
    }

    await addTagsToCache(docData.tags)

    return insertDocIntoIndex(doc, docData)
  })

function isUserDocument(doc) {
  // TODO: Check what collection it is in - users can have empty username!
  return !!doc.get(UserFieldNames.username)
}

exports.onCommentCreated = functions.firestore
  .document('comments/{commentId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const parentDoc = await docData[CommentFieldNames.parent].get()
    const originalAuthor = isUserDocument(parentDoc)
      ? docData[CommentFieldNames.parent]
      : parentDoc.get(AssetFieldNames.createdBy)

    await storeInNotifications(
      'Created comment',
      docData[CommentFieldNames.parent],
      originalAuthor,
      {
        author: docData[CommentFieldNames.createdBy],
      }
    )

    const commenterDoc = await docData[CommentFieldNames.createdBy].get()

    if (isUserDocument(parentDoc)) {
      await emitToDiscordActivity(
        `User ${commenterDoc.get(
          UserFieldNames.username
        )} has commented on user profile for ${parentDoc.get(
          UserFieldNames.username
        )}`,
        [getEmbedForViewProfile(parentDoc.id)]
      )
    } else if (
      !isPrivate(docData) &&
      !isNotApproved(docData) &&
      !isDeleted(docData)
    ) {
      await emitToDiscordActivity(
        `User ${commenterDoc.get(
          UserFieldNames.username
        )} has commented on asset "${parentDoc.get(AssetFieldNames.title)}"`,
        [getEmbedForViewAsset(parentDoc.id)]
      )
    }

    return storeInHistory(
      'Created comment',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
        parent: doc[CommentFieldNames.parent],
      },
      docData[CommentFieldNames.createdBy]
    )
  })

exports.onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const docData = doc.data()

    return storeInHistory(
      'Edited user',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDoc.data()),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )
  })

exports.onUserSignup = functions.auth.user().onCreate(async (user) => {
  const { uid } = user

  const userRecord = db.collection('users').doc(uid)

  await userRecord.set({
    isAdmin: false,
    isEditor: false,
    username: '',
  })

  const profileRecord = db.collection('profiles').doc(uid)

  await profileRecord.set({
    bio: '',
  })

  await emitToDiscordActivity(`User ${uid} signed up`, [
    getEmbedForViewProfile(uid),
  ])

  return storeInHistory(`User signup`, userRecord)
})

exports.onProfileUpdated = functions.firestore
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
      docData.lastModifiedBy
    )
  })

exports.onRequestCreated = functions.firestore
  .document('requests/{requestId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const creatorDoc = await docData[RequestsFieldNames.createdBy].get()

    await emitToDiscordActivity(
      `${creatorDoc.get(UserFieldNames.username)} created request "${doc.get(
        RequestsFieldNames.title
      )}"`,
      [getEmbedForViewRequest(doc.id)]
    )

    return storeInHistory(
      'Created request',
      doc.ref,
      {
        fields: replaceReferencesWithString(docData),
      },
      docData.createdBy
    )
  })

exports.onRequestEdited = functions.firestore
  .document('requests/{requestId}')
  .onUpdate(async ({ before: beforeDoc, after: doc }) => {
    const beforeDocData = beforeDoc.data()
    const docData = doc.data()

    await storeInHistory(
      'Edited request',
      doc.ref,
      {
        diff: getDifferenceInObjects(
          replaceReferencesWithString(beforeDocData),
          replaceReferencesWithString(docData)
        ),
      },
      docData.lastModifiedBy
    )
  })

exports.onTweetCreated = functions.firestore
  .document('tweets/{tweetId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const tweetId = await sendTweet(docData.status)

    await updateTweetRecordInDatabase(doc.id, tweetId)
  })

async function insertAssetsIntoIndex() {
  const { docs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
    .get()

  const algoliaObjects = docs.map((doc) =>
    convertDocToAlgoliaRecord(doc.id, doc.data())
  )

  await getAlgoliaClient()
    .initIndex(ALGOLIA_INDEX_NAME)
    .saveObjects(algoliaObjects)
}

exports.syncIndex = functions.https.onRequest(async (req, res) => {
  try {
    await insertAssetsIntoIndex()
    res.status(200).send('Index has been synced')
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`)
  }
})
