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

const OrderDirections = {
  ASC: 'asc',
  DESC: 'desc',
}
module.exports.OrderDirections = OrderDirections

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
  Downloads: 'downloads',
  Requests: 'requests',
  Notifications: 'notifications',
  Polls: 'polls',
  PollResponses: 'pollResponses',
  GuestUsers: 'guestUsers',
  Authors: 'authors',
  DiscordServers: 'discordServers',
  Likes: 'likes',
  Species: 'species',
  Special: 'special',
  PollTallies: 'pollTallies',
  FeaturedAssetsForUsers: 'featuredAssetsForUsers',
  Tweets: 'tweets',
  AssetAmendments: 'assetAmendments',
  UserMeta: 'userMeta',
  DiscordMessages: 'discordMessages',
  AssetMeta: 'assetMeta',
  ViewCache: 'viewCache',
  Products: 'products',
  Transactions: 'transactions',
}
module.exports.CollectionNames = CollectionNames

const AssetMetaFieldNames = {
  // comments: 'comments',
  authorName: 'authorName',
  speciesNames: 'speciesNames',
  // createdByName: 'createdByName',
  // lastModifiedByName: 'lastModifiedByName',
  linkedAssets: 'linkedAssets',
  discordServer: 'discordServer',
  endorsementCount: 'endorsementCount',
  lastModifiedAt: 'lastModifiedAt',
  product: 'product',
  contentAssets: 'contentAssets',
}
module.exports.AssetMetaFieldNames = AssetMetaFieldNames

const EndorsementFieldNames = {
  asset: 'asset',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
}
module.exports.EndorsementFieldNames = EndorsementFieldNames

const UserMetaFieldNames = {
  isPatron: 'isPatron',
  patreonUserId: 'patreonUserId',
  patreonRewardIds: 'patreonRewardIds',
  // future fields
  isAdmin: 'isAdmin',
  isEditor: 'isEditor',
  isBanned: 'isBanned',
  banReason: 'banReason',
  // meta
  lastModifiedAt: 'lastModifiedAt',
  lastModifiedBy: 'lastModifiedBy',
}
module.exports.UserMetaFieldNames = UserMetaFieldNames

const AssetAmendmentFieldNames = {
  asset: 'asset',
  fields: 'fields',
  comments: 'comments',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isRejected: 'isRejected',
}
module.exports.AssetAmendmentFieldNames = AssetAmendmentFieldNames

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
  authorName: 'authorName', // deprecated
  author: 'author',
  children: 'children',
  ownedBy: 'ownedBy',
  isPinned: 'isPinned',
  discordServer: 'discordServer',
  bannerUrl: 'bannerUrl',
  tutorialSteps: 'tutorialSteps',
  pedestalVideoUrl: 'pedestalVideoUrl',
  pedestalFallbackImageUrl: 'pedestalFallbackImageUrl',
  sketchfabEmbedUrl: 'sketchfabEmbedUrl',
  slug: 'slug',
  shortDescription: 'shortDescription',
}
module.exports.AssetFieldNames = AssetFieldNames

const AssetCategories = {
  accessory: 'accessory',
  animation: 'animation',
  tutorial: 'tutorial',
  avatar: 'avatar',
  article: 'article',
  world: 'world',
  tool: 'tool',
  alteration: 'alteration',
  content: 'content',
}
module.exports.AssetCategories = AssetCategories

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
  notificationPrefs: 'notificationPrefs',
  discordUserId: 'discordUserId',
}
module.exports.ProfileFieldNames = ProfileFieldNames

const SpeciesFieldNames = {
  singularName: 'singularName',
  pluralName: 'pluralName',
  description: 'description',
  shortDescription: 'shortDescription',
  thumbnailUrl: 'thumbnailUrl',
  fallbackThumbnailUrl: 'fallbackThumbnailUrl',
  thumbnailSourceUrl: 'thumbnailSourceUrl',
  isPopular: 'isPopular',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  slug: 'slug',
}
module.exports.SpeciesFieldNames = SpeciesFieldNames

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
  isPatron: 'isPatron', // deprecated
  patreonUserId: 'patreonUserId', // deprecated
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

const DiscordMessageFieldNames = {
  channelName: 'channelName',
  message: 'message',
  embeds: 'embeds',
  status: 'status',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
}
module.exports.DiscordMessageFieldNames = DiscordMessageFieldNames

const DiscordMessageStatuses = {
  Queued: 'queued',
  Sent: 'sent',
  Error: 'error',
}
module.exports.DiscordMessageStatuses = DiscordMessageStatuses

const LikeFieldNames = {
  parent: 'parent',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
}
module.exports.LikeFieldNames = LikeFieldNames

const PollsFieldNames = {
  question: 'question',
  answers: 'answers',
  isClosed: 'isClosed',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
}
module.exports.PollsFieldNames = PollsFieldNames

const PollResponsesFieldNames = {
  poll: 'poll',
  answer: 'answer',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
}
module.exports.PollResponsesFieldNames = PollResponsesFieldNames

const PollTalliesFieldNames = {
  tally: 'tally',
}
module.exports.PollTalliesFieldNames = PollTalliesFieldNames

const FeaturedAssetForUsersFieldNames = {
  assets: 'assets',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
}
module.exports.FeaturedAssetForUsersFieldNames = FeaturedAssetForUsersFieldNames

const specialCollectionIds = {
  featured: 'featured', // TODO: Remove
  featuredAssets: 'featuredAssets',
  homepage: 'homepage',
  avatarList: 'avatarList',
}
module.exports.specialCollectionIds = specialCollectionIds

const AvatarListFieldNames = {
  avatars: 'avatars',
  lastModifiedAt: 'lastModifiedAt',
  species: 'species',
}
module.exports.AvatarListFieldNames = AvatarListFieldNames

const ProductFieldNames = {
  asset: 'asset',
  priceUsd: 'priceUsd',
  isSaleable: 'isSaleable',
  isApproved: 'isApproved',
  isDeleted: 'isDeleted',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
}
module.exports.ProductFieldNames = ProductFieldNames

const TransactionFieldNames = {
  customer: 'customer',
  product: 'product',
  priceUsd: 'priceUsd',
  status: 'status',
  braintreeTransactionId: 'braintreeTransactionId',
  braintreeTransactionData: 'braintreeTransactionData',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
}
module.exports.TransactionFieldNames = TransactionFieldNames

module.exports.isApproved = (docData) => {
  return docData[AssetFieldNames.isApproved] === true
}

module.exports.isNotApproved = (docData) => {
  return docData[AssetFieldNames.isApproved] === false
}

module.exports.isDeleted = (docData) => {
  return docData[AssetFieldNames.isDeleted] === true
}

module.exports.isPrivate = (docData) => {
  return docData[AssetFieldNames.isPrivate] === true
}

module.exports.isAdult = (docData) => {
  return docData[AssetFieldNames.isAdult] === true
}

module.exports.hasAssetJustBeenPublished = (beforeDocData, afterDocData) => {
  return (
    beforeDocData[AssetFieldNames.isPrivate] === true &&
    afterDocData[AssetFieldNames.isPrivate] !== true
  )
}

module.exports.hasAssetJustBeenApproved = (beforeDocData, afterDocData) => {
  return (
    beforeDocData[AssetFieldNames.isApproved] !== true &&
    afterDocData[AssetFieldNames.isApproved] === true
  )
}

module.exports.hasAssetJustBeenDeleted = (beforeDocData, afterDocData) => {
  return (
    beforeDocData[AssetFieldNames.isDeleted] !== true &&
    afterDocData[AssetFieldNames.isDeleted] === true
  )
}

const isFirebaseReference = (thing) =>
  thing instanceof admin.firestore.DocumentReference
const firebaseReferenceToRef = (reference) => ({
  ref: {
    id: reference.id,
    collection: reference.parent.id,
  },
})

module.exports.replaceReferencesWithString = (object) => {
  const newObject = {}

  for (const key in object) {
    let val = object[key]

    if (Array.isArray(val)) {
      newObject[key] = val.map((item) => {
        if (isFirebaseReference(item)) {
          return firebaseReferenceToRef(item)
          // always null chuck
        } else if (item && typeof item === 'object') {
          // eslint-disable-next-line
          if (item.hasOwnProperty('_seconds')) {
            return secondsToDate(item._seconds)
          } else {
            return module.exports.replaceReferencesWithString(item)
          }
        }
        return item
      })
      continue
    }

    // always null check
    if (val && typeof val === 'object') {
      // eslint-disable-next-line
      if (val.hasOwnProperty('_seconds')) {
        newObject[key] = secondsToDate(val._seconds)
        continue
      }

      // if a Firebase reference
      if (isFirebaseReference(val)) {
        // trust the frontend can parse this
        newObject[key] = firebaseReferenceToRef(val)
        continue
      }
    }

    newObject[key] = val
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

module.exports.getHasArrayOfReferencesChanged = (beforeItems, afterItems) => {
  // note: always assuming species is populated as empty array (not null)

  if (!beforeItems && !afterItems) {
    return false
  }

  if (!beforeItems && afterItems) {
    return true
  }

  if (beforeItems && !afterItems) {
    return true
  }

  if (beforeItems.length !== afterItems.length) {
    return true
  }

  for (const beforeItem of beforeItems) {
    // if removed
    if (!afterItems.find((item) => item.id === beforeItem.id)) {
      console.debug(`removed item ${beforeItem.id}`)
      return true
    }
  }
  for (const afterItem of afterItems) {
    // if added
    if (!beforeItems.find((item) => item.id === afterItem.id)) {
      console.debug(`added item ${afterItem.id}`)
      return true
    }
  }

  return false
}

module.exports.getHasArrayOfStringsChanged = (beforeItems, afterItems) => {
  if (!beforeItems && !afterItems) {
    return false
  }

  if ((!beforeItems && afterItems) || (beforeItems && !afterItems)) {
    return true
  }

  if (beforeItems.length !== afterItems.length) {
    return true
  }

  for (const [beforeItem, index] of beforeItems.entries()) {
    if (afterItems[index] !== beforeItem) {
      return true
    }
  }
  for (const [afterItem, index] of afterItems.entries()) {
    if (afterItems[index] !== afterItem) {
      return true
    }
  }

  return false
}
