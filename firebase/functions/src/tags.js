const { db } = require('./firebase')

const summariesIdTags = 'tags'

module.exports.tagsKeyAllTags = 'allTags'

module.exports.getAllTags = async () => {
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

module.exports.addTagsToCache = async (tags) => {
  if (!tags) {
    return
  }

  const tagsDoc = await db
    .collection(CollectionNames.Summaries)
    .doc(summariesIdTags)
  const tagsRecord = await tagsDoc.get()
  let allTags = []
  const knownTags = tagsRecord.get(tagsKeyAllTags)

  if (knownTags) {
    allTags = knownTags.concat(tags)
  } else {
    allTags = await getAllTags()
  }

  const allTagsWithoutDupes = allTags.filter(
    (tag, idx) => allTags.indexOf(tag) === idx
  )

  await tagsDoc.set({
    [tagsKeyAllTags]: allTagsWithoutDupes,
  })
}
