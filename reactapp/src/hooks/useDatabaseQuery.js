import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useRef } from 'react'
import { inDevelopment } from '../environment'
import { handleError } from '../error-handling'
import { isRef, getDocument } from '../utils'

export const Operators = {
  EQUALS: '==',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  ARRAY_CONTAINS: 'array-contains'
}

export const OrderDirections = {
  ASC: 'asc',
  DESC: 'desc'
}

export const CollectionNames = {
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
  Reports: 'reports',
  AwardsForUsers: 'awardsForUsers'
}

export const ReportFieldNames = {
  parent: 'parent',
  reason: 'reason',
  comments: 'comments',
  isVerified: 'isVerified',
  isDeleted: 'isDeleted',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt'
}

export const ReportReasons = {
  OUTDATED_CONTENT: 'OUTDATED_CONTENT',
  OFFENSIVE_CONTENT: 'OFFENSIVE_CONTENT',
  BROKEN_SOURCE: 'BROKEN_SOURCE',
  SPAM: 'SPAM',
  OTHER: 'OTHER',
  CLAIM_OWNERSHIP: 'CLAIM_OWNERSHIP'
}

export const ViewCacheNames = {
  CategoryAccessory: 'CategoryAccessory',
  ViewAllSpecies: 'ViewAllSpecies'
}

export const AssetMetaFieldNames = {
  // comments: 'comments',
  authorName: 'authorName',
  speciesNames: 'speciesNames',
  // createdByName: 'createdByName',
  // lastModifiedByName: 'lastModifiedByName',
  linkedAssets: 'linkedAssets',
  incomingLinkedAssets: 'incomingLinkedAssets',
  discordServer: 'discordServer',
  endorsementCount: 'endorsementCount',
  lastModifiedAt: 'lastModifiedAt',
  product: 'product',
  contentAssets: 'contentAssets'
}

export const UserMetaFieldNames = {
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
  lastModifiedBy: 'lastModifiedBy'
}

export const specialCollectionIds = {
  featured: 'featured', // TODO: Remove
  featuredAssets: 'featuredAssets',
  homepage: 'homepage',
  avatarList: 'avatarList',
  avatarList1: 'avatarList1', // docs have a 1mb limit and we've hit that so a temporary workaround
  avatarList2: 'avatarList2' // docs have a 1mb limit and we've hit that so a temporary workaround
}

export const AvatarListFieldNames = {
  avatars: 'avatars',
  lastModifiedAt: 'lastModifiedAt',
  species: 'species'
}

export const FeaturedAssetForUsersFieldNames = {
  assets: 'assets',
  overrideAsset: 'overrideAsset',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt'
}

export const AssetFieldNames = {
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
  clonableWorld: 'clonableWorld',
  shortDescription: 'shortDescription'
}

export const AssetAmendmentFieldNames = {
  asset: 'asset',
  fields: 'fields',
  comments: 'comments',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isRejected: 'isRejected'
}

export const TutorialStepFieldNames = {
  number: 'number', // 1 onwards
  title: 'title',
  description: 'description',
  imageUrls: 'imageUrls', // todo: rename to imageUrl
  youtubeUrl: 'youtubeUrl'
}

export const AssetCategories = {
  accessory: 'accessory',
  animation: 'animation',
  tutorial: 'tutorial',
  avatar: 'avatar',
  article: 'article',
  world: 'world',
  tool: 'tool',
  alteration: 'alteration',
  content: 'content'
}

export const UserFieldNames = {
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
  isPatron: 'isPatron'
}

export const ProfileFieldNames = {
  vrchatUserId: 'vrchatUserId',
  vrchatUsername: 'vrchatUsername',
  discordUsername: 'discordUsername',
  twitterUsername: 'twitterUsername',
  telegramUsername: 'telegramUsername',
  youtubeChannelId: 'youtubeChannelId',
  twitchUsername: 'twitchUsername',
  patreonUsername: 'patreonUsername',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  bio: 'bio',
  notifyOnUnapprovedAssets: 'notifyOnUnapprovedAssets', // deprecated
  notificationEmail: 'notificationEmail',
  favoriteSpecies: 'favoriteSpecies',
  notificationPrefs: 'notificationPrefs',
  discordUserId: 'discordUserId',
  neosVrUsername: 'neosVrUsername',
  chilloutVrUsername: 'chilloutVrUsername'
}

export const CommentFieldNames = {
  parent: 'parent',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  isDeleted: 'isDeleted',
  lastModifiedAt: 'lastModifiedAt',
  lastModifiedBy: 'lastModifiedBy'
}

export const HistoryFieldNames = {
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  parent: 'parent',
  message: 'message',
  data: 'data'
}

export const NoticesFieldNames = {
  order: 'order',
  createdAt: 'createdAt',
  isVisible: 'isVisible'
}

export const EndorsementFieldNames = {
  asset: 'asset',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
}

export const RequestsFieldNames = {
  title: 'title',
  description: 'description',
  isClosed: 'isClosed',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  isDeleted: 'isDeleted'
}

export const DownloadsFieldNames = {
  asset: 'asset',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
}

export const NotificationsFieldNames = {
  recipient: 'recipient',
  message: 'message',
  parent: 'parent',
  isRead: 'isRead',
  createdAt: 'createdAt'
}

export const PollsFieldNames = {
  question: 'question',
  answers: 'answers',
  isClosed: 'isClosed',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
}

export const PollResponsesFieldNames = {
  poll: 'poll',
  answer: 'answer',
  createdBy: 'createdBy',
  createdAt: 'createdAt'
}

export const GuestUsersFieldNames = {
  ipAddress: 'ipAddress',
  createdAt: 'createdAt'
}

export const AuthorFieldNames = {
  name: 'name',
  description: 'description',
  websiteUrl: 'websiteUrl',
  email: 'email',
  twitterUsername: 'twitterUsername',
  gumroadUsername: 'gumroadUsername',
  discordUsername: 'discordUsername',
  discordServerInviteUrl: 'discordServerInviteUrl',
  patreonUsername: 'patreonUsername',
  categories: 'categories',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  ownedBy: 'ownedBy',
  discordServerId: 'discordServerId',
  isOpenForCommission: 'isOpenForCommission',
  commissionInfo: 'commissionInfo',
  showCommissionStatusForAssets: 'showCommissionStatusForAssets',
  avatarUrl: 'avatarUrl',
  // fallbackAvatarUrl: 'fallbackAvatarUrl', REMOVED
  bannerUrl: 'bannerUrl',
  fallbackBannerUrl: 'fallbackBannerUrl',
  inheritFields: 'inheritFields',
  isDeleted: 'isDeleted'
}

export const DiscordServerFieldNames = {
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
  isApproved: 'isApproved',
  isDeleted: 'isDeleted'
}

export const LikeFieldNames = {
  parent: 'parent',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
}

export const SpeciesFieldNames = {
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
  slug: 'slug'
}

export const HomepageFieldNames = {
  lastUpdatedAt: 'lastUpdatedAt',
  siteStats: 'siteStats',
  patreon: 'patreon'
}

export const HomepageSiteStatsFieldNames = {
  numAssets: 'numAssets',
  numAvatars: 'numAvatars',
  numAccessories: 'numAccessories',
  numUsers: 'numUsers'
}

export const HomepagePatreonFieldNames = {
  numConnectedToPatreon: 'numConnectedToPatreon'
}

export const ProductFieldNames = {
  asset: 'asset',
  title: 'title',
  description: 'description',
  priceUsd: 'priceUsd',
  isSaleable: 'isSaleable',
  isApproved: 'isApproved',
  isDeleted: 'isDeleted',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
}

export const TransactionFieldNames = {
  customer: 'customer',
  product: 'product',
  priceUsd: 'priceUsd',
  status: 'status',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
}

export function getWhereClausesAsString(whereClauses) {
  if (whereClauses === undefined) {
    return 'undefined'
  }
  if (whereClauses === false) {
    return 'false'
  }
  if (getIsGettingSingleRecord(whereClauses)) {
    return whereClauses
  }
  if (Array.isArray(whereClauses)) {
    return whereClauses
      .map(
        ([fieldName, operator, value]) =>
          `[${fieldName},${operator},${
            isRef(value) ? `${value.ref.collectionName}=${value.ref.id}` : value
          }]`
      )
      .join(',')
  }
  return whereClauses
}

function getStartAfterAsString(startAfter) {
  if (!startAfter) {
    return ''
  }
  return startAfter.id
}

function getIsGettingSingleRecord(whereClauses) {
  return typeof whereClauses === 'string'
}

const secondsToDate = seconds => new Date(seconds * 1000)

export const mapDates = doc => {
  if (!doc) {
    return doc
  }

  const entries = Object.entries(doc)

  const newDoc = entries.reduce((finalDoc, [key, value]) => {
    return {
      ...finalDoc,
      [key]:
        value && value.hasOwnProperty('seconds')
          ? secondsToDate(value.seconds)
          : value
    }
  }, {})

  return newDoc
}

const getDataFromReference = async record => {
  console.debug(`get ${record.path}`)
  const result = await record.get()
  return {
    ...result.data(),
    id: record.id,
    refPath: result.ref.path
  }
}

const mapReferences = async (
  doc,
  fetchChildren = true,
  populateRefs = false
) => {
  if (!doc) {
    return doc
  }

  if (!fetchChildren) {
    return doc
  }

  const newDoc = { ...doc }

  const results = await Promise.all(
    Object.entries(newDoc).map(async ([key, value]) => {
      if (
        value &&
        value instanceof firebase.firestore.DocumentReference &&
        populateRefs
      ) {
        return [key, await getDataFromReference(value)]
      }
      // Bad hack for the Notifications Added comment author / Added tag amendment field :)
      if (
        value &&
        typeof value === 'object' &&
        (value.author || value.creator)
      ) {
        return [key, await mapReferences(value, true, true)]
      }
      return [key, await Promise.resolve(value)]
    })
  )

  results.forEach(([key, value]) => (newDoc[key] = value))

  return newDoc
}

// the 2nd arg is to avoid an infinite loop with fetching children who then have children that refer to the parent
export async function formatRawDoc(
  doc,
  fetchChildren = true,
  populateRefs = false
) {
  const formattedDocs = await formatRawDocs([doc], fetchChildren, populateRefs)
  return formattedDocs[0]
}

function isFirebaseDoc(value) {
  return value && value instanceof firebase.firestore.DocumentReference
}

async function mapDocArrays(doc, fetchChildren = true, populateRefs = false) {
  if (!doc) {
    return doc
  }

  if (!fetchChildren) {
    return doc
  }

  const newFields = await Promise.all(
    Object.entries(doc).map(async ([key, value]) => {
      if (Array.isArray(value) && value.length) {
        const results = await Promise.all(
          value.map(async item => {
            if (isFirebaseDoc(item) && populateRefs) {
              console.debug(`get ${item.path}`)
              const doc = await item.get()
              return formatRawDoc(doc, false)
            } else {
              return Promise.resolve(item)
            }
          })
        )

        return [key, results]
      }
      // Hack to support history data having a "parent" field ie. comments
      if (
        value &&
        typeof value === 'object' &&
        value.parent &&
        isFirebaseDoc(value.parent)
      ) {
        return [
          key,
          {
            ...value,
            parent: await formatRawDoc(await value.parent.get(), false)
          }
        ]
      }
      return [key, await Promise.resolve(value)]
    })
  )

  return newFields.reduce(
    (newDoc, [key, value]) => ({
      ...newDoc,
      [key]: value
    }),
    {}
  )
}

// the 2nd arg is to avoid an infinite loop with fetching children who then have children that refer to the parent
export async function formatRawDocs(
  docs,
  fetchChildren = true,
  populateRefs = false
) {
  const docsWithDates = docs
    .map(doc =>
      !doc.exists
        ? null
        : {
            ...doc.data(),
            id: doc.id,
            parentPath: doc.ref.parent.path,
            snapshot: doc
          }
    )
    .map(mapDates)

  const mappedRefs = await Promise.all(
    docsWithDates.map(doc => mapReferences(doc, fetchChildren, populateRefs))
  )
  return Promise.all(
    mappedRefs.map(ref => mapDocArrays(ref, fetchChildren, populateRefs))
  )
}

function getLimitAsString(limit) {
  if (!limit) {
    return ''
  }
  return limit
}

export function getOrderByAsString(orderBy) {
  if (!orderBy) {
    return ''
  }
  return orderBy.join('+')
}

export const options = {
  limit: 'limit',
  orderBy: 'orderBy',
  subscribe: 'subscribe',
  startAfter: 'startAfter',
  populateRefs: 'populateRefs',
  queryName: 'queryName'
}

const getOptionsIfProvided = maybeOptions => {
  if (typeof maybeOptions === 'object') {
    return maybeOptions
  } else {
    return false
  }
}

export default (
  collectionName,
  whereClauses,
  limitOrOptions,
  orderBy,
  subscribe = true,
  startAfter = undefined,
  populateRefs = false
) => {
  const [recordOrRecords, setRecordOrRecords] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const unsubscribeFromSnapshotRef = useRef()

  const options = getOptionsIfProvided(limitOrOptions) || {
    limit: limitOrOptions,
    orderBy,
    subscribe,
    startAfter,
    populateRefs
  }

  const whereClausesAsString = getWhereClausesAsString(whereClauses)
  const orderByAsString = getOrderByAsString(options.orderBy)
  const startAfterAsString = getStartAfterAsString(options.startAfter)
  const limitAsString = getLimitAsString(options.limit)

  // const subscribe = getIfToSubscribe(subscribeOrOptions)

  async function doIt() {
    try {
      if (inDevelopment()) {
        console.debug(
          'useDatabaseQuery',
          collectionName,
          whereClausesAsString,
          limitAsString,
          orderByAsString,
          startAfterAsString,
          options.queryName
        )
      }

      setIsLoading(true)
      setIsErrored(false)

      const isGettingSingleRecord = getIsGettingSingleRecord(whereClauses)

      let queryChain = firebase.firestore().collection(collectionName)

      // If an ID
      if (isGettingSingleRecord) {
        const id = whereClauses
        queryChain = queryChain.doc(id)
        // or an array of searches
      } else if (Array.isArray(whereClauses)) {
        for (const [field, operator, value] of whereClauses) {
          let valueToUse = value

          if (isRef(value)) {
            valueToUse = getDocument(value.ref.collectionName, value.ref.id)
          }

          queryChain = queryChain.where(field, operator, valueToUse)
        }
        // or undefined - all results
      } else {
      }

      if (options.limit) {
        queryChain = queryChain.limit(options.limit)
      }

      if (options.orderBy) {
        queryChain = queryChain.orderBy(options.orderBy[0], options.orderBy[1])
      }

      if (options.startAfter) {
        queryChain = queryChain.startAfter(options.startAfter)
      }

      async function processResults(results) {
        if (isGettingSingleRecord) {
          setRecordOrRecords(
            await formatRawDoc(results, true, options.populateRefs)
          )
        } else {
          setRecordOrRecords(
            await formatRawDocs(results.docs, true, options.populateRefs)
          )
        }

        setIsLoading(false)
        setIsErrored(false)
      }

      if (options.subscribe) {
        unsubscribeFromSnapshotRef.current = queryChain.onSnapshot(
          processResults
        )
      } else {
        processResults(await queryChain.get())

        setIsLoading(false)
        setIsErrored(false)
      }
    } catch (err) {
      console.error('Failed to use database query', err)
      setIsLoading(false)
      setIsErrored(true)
      handleError(err)
    }
  }

  useEffect(() => {
    if (whereClauses === false) {
      setIsLoading(false)
      return
    }

    doIt()

    return () => {
      // Avoid setting state on an unmounted component
      const unsubscribe = unsubscribeFromSnapshotRef.current
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [
    collectionName,
    whereClausesAsString,
    orderByAsString,
    startAfterAsString,
    limitAsString
  ])

  return [isLoading, isErrored, recordOrRecords]
}
