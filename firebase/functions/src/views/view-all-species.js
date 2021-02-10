const { db, CollectionNames } = require('../firebase')

const { ViewCacheNames, ViewCacheStandardFieldNames } = require('../view-cache')

const CacheFieldNames = {
  species: 'species',
}

const ExtraSpeciesFieldNames = {
  species: 'species',
}

const convertSpeciesDocIntoItem = (doc) => ({
  [ExtraSpeciesFieldNames.species]: doc.ref,
  ...doc.data(),
})

async function hydrate(speciesDoc) {
  const existingCacheRef = db
    .collection(CollectionNames.ViewCache)
    .doc(ViewCacheNames.ViewAllSpecies)
  const existingCacheDoc = await existingCacheRef.get()

  const existingItems = existingCacheDoc.get(CacheFieldNames.species) || []
  let newItems = [...existingItems]

  console.debug(`found ${existingItems.length} items already in cache`)

  console.debug(`deciding if to insert, update or delete ${speciesDoc.id}`)

  const foundIndex = existingItems.findIndex(
    (item) => item[ExtraSpeciesFieldNames.species].id === speciesDoc.id
  )
  const itemToInsert = convertSpeciesDocIntoItem(speciesDoc)

  if (foundIndex !== -1) {
    console.debug(`found item - updating...`)
    newItems[foundIndex] = itemToInsert
  } else {
    console.debug(`did not find item - inserting...`)
    newItems = newItems.concat([itemToInsert])
  }

  return existingCacheRef.set(
    {
      [CacheFieldNames.species]: newItems,
      [ViewCacheStandardFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}
module.exports.hydrate = hydrate

async function sync() {
  console.debug(`syncing ${ViewCacheNames.ViewAllSpecies}`)

  const existingCacheRef = db
    .collection(CollectionNames.ViewCache)
    .doc(ViewCacheNames.ViewAllSpecies)
  const existingCacheDoc = await existingCacheRef.get()
  const existingItems = existingCacheDoc.get(CacheFieldNames.species) || []

  console.debug(`found ${existingItems.length} items already in cache`)

  const { docs } = await db.collection(CollectionNames.Species).get()

  console.debug(`${docs.length} items to sync into cache`)

  const itemsToInsert = docs.map(convertSpeciesDocIntoItem)

  return existingCacheRef.set(
    {
      [CacheFieldNames.species]: itemsToInsert,
      [ViewCacheStandardFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}
module.exports.sync = sync
