import { useEffect, useState } from 'react'
import { firestore } from 'firebase/app'
import { useRef } from 'react'
import { inDevelopment } from '../environment'

export const Operators = {
  EQUALS: '==',
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
  Profiles: 'profiles'
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
  lastModifiedAt: 'lastModifiedAt'
}

export const AssetCategories = {
  accessory: 'accessory',
  animation: 'animation',
  tutorial: 'tutorial',
  avatar: 'avatar',
  article: 'article',
  world: 'world'
}

export const UserFieldNames = {
  username: 'username',
  enabledAdultContent: 'enabledAdultContent',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt'
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
  bio: 'bio'
}

export const CommentFieldNames = {
  parent: 'parent'
}

export const HistoryFieldNames = {
  createdAt: 'createdAt'
}

export const NoticesFieldNames = {
  order: 'order',
  createdAt: 'createdAt'
}

export const EndorsementFieldNames = {
  asset: 'asset',
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

const mapReferences = async doc => {
  const newDoc = { ...doc }

  const results = await Promise.all(
    Object.entries(newDoc).map(async ([key, value]) => {
      if (value && value instanceof firestore.DocumentReference) {
        return [key, await getDataFromReference(value)]
      }
      return [key, await Promise.resolve(value)]
    })
  )

  results.forEach(([key, value]) => (newDoc[key] = value))

  return newDoc
}

export async function formatRawDoc(doc) {
  const formattedDocs = await formatRawDocs([doc])
  return formattedDocs[0]
}

export async function formatRawDocs(docs) {
  const docsWithDates = docs
    .map(doc => ({ ...doc.data(), id: doc.id }))
    .map(mapDates)

  return Promise.all(docsWithDates.map(mapReferences))
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
          queryChain = queryChain.where(field, operator, value)
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
      console.error(err)
      setIsLoading(false)
      setIsErrored(true)
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
