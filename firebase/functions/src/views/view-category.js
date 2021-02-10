const {
  db,
  CollectionNames,
  AssetCategories,
  AssetFieldNames,
  Operators,
} = require('../firebase')

const { ViewCacheStandardFieldNames } = require('../view-cache')

const CacheFieldNames = {
  assets: 'assets',
}

const convertAssetDocIntoCategoryItem = (doc) => ({
  asset: doc.ref,
  [AssetFieldNames.title]: doc.get(AssetFieldNames.title),
  [AssetFieldNames.description]: doc.get(AssetFieldNames.description),
  [AssetFieldNames.thumbnailUrl]: doc.get(AssetFieldNames.thumbnailUrl),
  [AssetFieldNames.isAdult]: doc.get(AssetFieldNames.isAdult), // for NSFW toggle
  [AssetFieldNames.createdAt]: doc.get(AssetFieldNames.createdAt), // for sorting
})

function shouldDeleteAssetFromCategoryCache(doc) {
  return (
    doc.get(AssetFieldNames.isApproved) === false ||
    doc.get(AssetFieldNames.isDeleted) === true ||
    doc.get(AssetFieldNames.isPrivate) === true
  )
}

async function hydrateCategory(categoryName, doc) {
  const existingCacheRef = db
    .collection(CollectionNames.ViewCache)
    .doc(`category-${categoryName}`)
  const existingCacheDoc = await existingCacheRef.get()

  const existingItems = existingCacheDoc.get(CacheFieldNames.assets) || []
  let newItems = [...existingItems]

  console.debug(`found ${existingItems.length} items already in cache`)

  console.debug(`deciding if to insert, update or delete ${doc.id}`)

  if (shouldDeleteAssetFromCategoryCache(doc)) {
    console.debug('should be deleted - deleting...')
    newItems = newItems.filter((item) => item.id === doc.id)
  } else {
    const foundIndex = existingItems.findIndex(
      (item) => item.asset.id === doc.id
    )
    const assetToInsert = convertAssetDocIntoCategoryItem(doc)

    if (foundIndex !== -1) {
      console.debug(`found item - updating...`)
      newItems[foundIndex] = assetToInsert
    } else {
      console.debug(`did not find item - inserting...`)
      newItems = newItems.concat([assetToInsert])
    }
  }

  return existingCacheRef.set(
    {
      [CacheFieldNames.assets]: newItems,
      [ViewCacheStandardFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}
module.exports.hydrateCategory = hydrateCategory

async function syncCategoryCache(categoryName) {
  const existingCacheRef = db
    .collection(CollectionNames.ViewCache)
    .doc(`category-${categoryName}`)
  const existingCacheDoc = await existingCacheRef.get()
  const existingAssets = existingCacheDoc.get(CacheFieldNames.assets) || []

  console.debug(
    `found ${existingAssets.length} items already in cache "${categoryName}"`
  )

  const { docs: assetDocs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.category, Operators.EQUALS, categoryName)
    .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
    .get()

  console.debug(`${assetDocs.length} items to insert into cache`)

  const newAssets = assetDocs.map(convertAssetDocIntoCategoryItem)

  return existingCacheRef.set(
    {
      [CacheFieldNames.assets]: newAssets,
      [ViewCacheStandardFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}

async function sync() {
  const categoryNames = Object.values(AssetCategories)

  for (const categoryName of categoryNames) {
    console.debug(`syncing category cache "${categoryName}"`)
    await syncCategoryCache(categoryName)
  }
}
module.exports.sync = sync
