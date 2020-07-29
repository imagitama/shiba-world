import { useEffect, useState } from 'react'
import { firestore } from 'firebase/app'
import { useRef } from 'react'
import { inDevelopment } from '../environment'
import { handleError } from '../error-handling'
import { isRef, getDocument } from '../utils'

export const Operators = {
  EQUALS: '==',
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
  Authors: 'authors'
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
  children: 'children'
}

export const AssetCategories = {
  accessory: 'accessory',
  animation: 'animation',
  tutorial: 'tutorial',
  avatar: 'avatar',
  article: 'article',
  world: 'world',
  tool: 'tool'
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
  createdAt: 'createdAt'
}

export const ProfileFieldNames = {
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
  notificationEmail: 'notificationEmail'
}

export const CommentFieldNames = {
  parent: 'parent',
  createdAt: 'createdAt',
  createdBy: 'createdBy'
}

export const HistoryFieldNames = {
  createdAt: 'createdAt'
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
  createdAt: 'createdAt',
  createdBy: 'createdBy'
}

function getWhereClausesAsString(whereClauses) {
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
        ([fieldName, operator, value]) => `[${fieldName},${operator},${value}]`
      )
      .join(',')
  }
  return whereClauses
}

function getIsGettingSingleRecord(whereClauses) {
  return typeof whereClauses === 'string'
}

const secondsToDate = seconds => new Date(seconds * 1000)

const mapDates = doc => {
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
  const result = await record.get()
  return {
    ...result.data(),
    id: record.id,
    refPath: result.ref.path
  }
}

const mapReferences = async (doc, fetchChildren = true) => {
  if (!fetchChildren) {
    return doc
  }

  const newDoc = { ...doc }

  const results = await Promise.all(
    Object.entries(newDoc).map(async ([key, value]) => {
      if (value && value instanceof firestore.DocumentReference) {
        return [key, await getDataFromReference(value)]
      }
      // Bad hack for the Notifications Added comment author field :)
      if (value && typeof value === 'object' && value.author) {
        return [key, await mapReferences(value)]
      }
      return [key, await Promise.resolve(value)]
    })
  )

  results.forEach(([key, value]) => (newDoc[key] = value))

  return newDoc
}

// the 2nd arg is to avoid an infinite loop with fetching children who then have children that refer to the parent
export async function formatRawDoc(doc, fetchChildren = true) {
  const formattedDocs = await formatRawDocs([doc], fetchChildren)
  return formattedDocs[0]
}

function isFirebaseDoc(value) {
  return value && value instanceof firestore.DocumentReference
}

async function mapDocArrays(doc, fetchChildren = true) {
  if (!fetchChildren) {
    return doc
  }

  const newFields = await Promise.all(
    Object.entries(doc).map(async ([key, value]) => {
      if (Array.isArray(value) && value.length && isFirebaseDoc(value[0])) {
        return [
          key,
          await formatRawDocs(
            await Promise.all(value.map(item => item.get())),
            false
          )
        ]
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
export async function formatRawDocs(docs, fetchChildren = true) {
  const docsWithDates = docs
    .map(doc => ({
      ...doc.data(),
      id: doc.id,
      parentPath: doc.ref.parent.path
    }))
    .map(mapDates)

  const mappedRefs = await Promise.all(
    docsWithDates.map(doc => mapReferences(doc, fetchChildren))
  )
  return Promise.all(mappedRefs.map(ref => mapDocArrays(ref, fetchChildren)))
}

function getOrderByAsString(orderBy) {
  if (!orderBy) {
    return ''
  }
  return orderBy.join('+')
}

export default (
  collectionName,
  whereClauses,
  limit,
  orderBy,
  subscribe = true
) => {
  const [recordOrRecords, setRecordOrRecords] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isErrored, setIsErrored] = useState(false)
  const unsubscribeFromSnapshotRef = useRef()

  const whereClausesAsString = getWhereClausesAsString(whereClauses)
  const orderByAsString = getOrderByAsString(orderBy)

  async function doIt() {
    try {
      if (inDevelopment()) {
        console.debug('useDatabaseQuery', collectionName, whereClausesAsString)
      }

      setIsLoading(true)
      setIsErrored(false)

      const isGettingSingleRecord = getIsGettingSingleRecord(whereClauses)

      let queryChain = firestore().collection(collectionName)

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

      if (limit) {
        queryChain = queryChain.limit(limit)
      }

      if (orderBy) {
        queryChain = queryChain.orderBy(orderBy[0], orderBy[1])
      }

      async function processResults(results) {
        if (isGettingSingleRecord) {
          setRecordOrRecords(await formatRawDoc(results))
        } else {
          setRecordOrRecords(await formatRawDocs(results.docs))
        }

        setIsLoading(false)
        setIsErrored(false)
      }

      if (subscribe) {
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
  }, [collectionName, whereClausesAsString, orderByAsString])

  return [isLoading, isErrored, recordOrRecords]
}
