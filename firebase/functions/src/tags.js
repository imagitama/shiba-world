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
