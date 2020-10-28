const admin = require('firebase-admin')
const { secondsToDate } = require('./utils')

admin.initializeApp()
const db = admin.firestore()
db.settings({ ignoreUndefinedProperties: true })

module.exports.db = db

const Operators = {
  EQUALS: '==',
  GREATER_THAN: '>',
  ARRAY_CONTAINS: 'array-contains',
}
module.exports.Operators = Operators

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
  Authors: 'authors',
  DiscordServers: 'discordServers',
  Patreons: 'patreons',
}
module.exports.CollectionNames = CollectionNames

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
  author: 'author',
}
module.exports.AssetFieldNames = AssetFieldNames

const CommentFieldNames = {
  comment: 'comment',
  parent: 'parent',
  createdBy: 'createdBy',
}
module.exports.CommentFieldNames = CommentFieldNames

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
module.exports.ProfileFieldNames = ProfileFieldNames

const UserFieldNames = {
  username: 'username',
  isEditor: 'isEditor',
  isAdmin: 'isAdmin',
  enabledAdultContent: 'enabledAdultContent',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  avatarUrl: 'avatarUrl',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isBanned: 'isBanned',
  banReason: 'banReason',
  isPatron: 'isPatron',
  patreonUserId: 'patreonUserId',
}
module.exports.UserFieldNames = UserFieldNames

const NotificationsFieldNames = {
  recipient: 'recipient',
  message: 'message',
  parent: 'parent',
  isRead: 'isRead',
  data: 'data',
  createdAt: 'createdAt',
}
module.exports.NotificationsFieldNames = NotificationsFieldNames

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
module.exports.RequestsFieldNames = RequestsFieldNames

const AuthorFieldNames = {
  name: 'name',
  description: 'description',
  twitterUsername: 'twitterUsername',
  gumroadUsername: 'gumroadUsername',
  categories: 'categories',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
}
module.exports.AuthorFieldNames = AuthorFieldNames

const DiscordServerFieldNames = {
  name: 'name',
  description: 'description',
  widgetId: 'widgetId',
  iconUrl: 'iconUrl',
  inviteUrl: 'inviteUrl',
  requiresPatreon: 'requiresPatreon',
  patreonUrl: 'patreonUrl',
  species: 'species',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
}
module.exports.DiscordServerFieldNames = DiscordServerFieldNames

const LikeFieldNames = {
  parent: 'parent',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
}
module.exports.LikeFieldNames = LikeFieldNames

module.exports.isNotApproved = (docData) => {
  return docData.isApproved === false
}

module.exports.isDeleted = (docData) => {
  return docData.isDeleted === true
}

module.exports.isPrivate = (docData) => {
  return docData.isPrivate === true
}

module.exports.isAdult = (docData) => {
  return docData[AssetFieldNames.isAdult] === true
}

module.exports.hasAssetJustBeenApproved = (beforeDocData, afterDocData) => {
  return (
    beforeDocData[AssetFieldNames.isApproved] !== true &&
    afterDocData[AssetFieldNames.isApproved] === true
  )
}

module.exports.replaceReferencesWithString = (object) => {
  const newObject = {}

  for (const key in object) {
    const val = object[key]

    // null, undefined, false, true, strings
    if (!val || typeof val === 'string' || val === true) {
      newObject[key] = val
      // array
    } else if (Array.isArray(val)) {
      newObject[key] = val

      // complex thing
    } else if (typeof val === 'object') {
      // if firebase reference
      if (val.id) {
        newObject[key] = module.exports.replaceReferencesWithString(val)

        // if special firebase date object
      } else if (val.hasOwnProperty('_seconds')) {
        const newVal = secondsToDate(val._seconds)
        newObject[key] = newVal.toString()

        // if date
      } else if (val instanceof Date) {
        newObject[key] = val

        // if plain object
      } else if (val.constructor === Object) {
        newObject[key] = val

        // anything else
      } else {
        // dont care
      }
    }
  }

  return newObject
}

module.exports.isUserDocument = (doc) => {
  // TODO: Check what collection it is in - users can have empty username!
  return Boolean(doc.get(UserFieldNames.username))
}

module.exports.retrieveAuthorNameFromAssetData = async (
  docData,
  defaultName = ''
) => {
  if (docData[AssetFieldNames.author]) {
    if (!docData[AssetFieldNames.author].get) {
      return Promise.reject(
        new Error(`Doc "${docData.title}" does not have valid author`)
      )
    }
    const authorDoc = await docData[AssetFieldNames.author].get()
    return authorDoc.get(AuthorFieldNames.name)
  }
  return Promise.resolve(defaultName)
}
