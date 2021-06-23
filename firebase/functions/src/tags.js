const { db, CollectionNames, AssetFieldNames } = require('./firebase')

const summariesIdTags = 'tags'
module.exports.summariesIdTags = summariesIdTags

const tagsKeyAllTags = 'allTags'
module.exports.tagsKeyAllTags = tagsKeyAllTags

const getAllTags = async () => {
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
module.exports.getAllTags = getAllTags

module.exports.addTagsToCache = async (tags) => {
  if (!tags) {
    return
  }

  console.debug('Adding tags to cache', tags)

  const tagsRef = db.collection(CollectionNames.Summaries).doc(summariesIdTags)
  const tagsDoc = await tagsRef.get()
  let allTags = []
  const knownTags = tagsDoc.get(tagsKeyAllTags)

  if (knownTags) {
    allTags = knownTags.concat(tags)
  } else {
    allTags = await getAllTags()
  }

  const allTagsWithoutDupes = allTags.filter(
    (tag, idx) => allTags.indexOf(tag) === idx
  )

  await tagsRef.set({
    [tagsKeyAllTags]: allTagsWithoutDupes,
  })

  console.debug('Finished adding tags to cache')
}

const OperationNames = {
  Add: 'add',
  Remove: 'remove',
  Rename: 'rename'
}

module.exports.bulkEditTags = async (userId, assetIds, operationName, tag, additionalTag = null) => {
  if (!userId) {
    throw new Error('Cannot bulk edit tags without a user ID!')
  }
  
  if (!assetIds || !assetIds.length) {
    throw new Error('Cannot bulk edit tags without asset IDs!')
  }
  
  if (!tag) {
    throw new Error(`Cannot bulk edit tags without a tag!`)
  }

  const userRef = db.collection(CollectionNames.Users).doc(userId)

  console.debug('bulk edit tags', userId, assetIds.length, operationName, tag, additionalTag)

  const batch = db.batch()
  let count = 0

  for (const assetId of assetIds) {
    const docRef = db.collection(CollectionNames.Assets).doc(assetId)
    const doc = await docRef.get()
    const { [AssetFieldNames.tags]: tags = [] } = doc.data()
    let newTags = tags

    switch (operationName) {
      case OperationNames.Add:
        if (newTags.includes(tag)) {
          continue
        }
        newTags = newTags.concat([tag])
        break

      case OperationNames.Remove:
        if (!newTags.includes(tag)) {
          continue
        }
        newTags = newTags.filter(item => item !== tag)
        break

      case OperationNames.Rename:
        if (newTags.includes(tag)) {
          newTags = newTags.filter(item => item !== tag)
        }
        if (!newTags.includes(additionalTag)) {
          newTags = newTags.concat([additionalTag])
        }
        break

      default:
        throw new Error(`Cannot bulk edit tags: unknown operation "${operationName}"`)
    }

    batch.set(docRef, {
      [AssetFieldNames.tags]: newTags,
      [AssetFieldNames.lastModifiedAt]: new Date(),
      [AssetFieldNames.lastModifiedBy]: userRef
    }, { merge: true })

    count++
  }

  await batch.commit()

  return {
    count
  }
}