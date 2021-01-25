const functions = require('firebase-functions')
const { db, CollectionNames } = require('../firebase')
const { getAllTags, tagsKeyAllTags, summariesIdTags } = require('../tags')

async function rebuildTagsCache() {
  const tagsDoc = await db
    .collection(CollectionNames.Summaries)
    .doc(summariesIdTags)
  const allTags = await getAllTags()

  const allTagsWithoutDupes = allTags.filter(
    (tag, idx) => allTags.indexOf(tag) === idx
  )

  return tagsDoc.set({
    [tagsKeyAllTags]: allTagsWithoutDupes,
  })
}

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await rebuildTagsCache()
    res.status(200).send('Tags have been synced')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('failed-to-sync-tags', err.message)
  }
})
