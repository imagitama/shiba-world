const {
  db,
  CollectionNames,
  AssetCategories,
  AssetFieldNames,
  Operators,
} = require('./firebase')

const ViewCacheNames = {
  CategoryAccessory: 'CategoryAccessory',
}
module.exports.ViewCacheNames = ViewCacheNames

const ViewCacheFieldNames = {
  lastModifiedAt: 'lastModifiedAt',
}

const ViewCacheCategoryFieldNames = {
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

  const existingItems =
    existingCacheDoc.get(ViewCacheCategoryFieldNames.assets) || []
  let newAssets = [...existingItems]

  console.debug(`found ${existingItems.length} assets already in cache`)

  console.debug(`deciding if to insert, update or delete asset ${doc.id}`)

  if (shouldDeleteAssetFromCategoryCache(doc)) {
    console.debug('should be deleted - deleting...')
    newAssets = newAssets.filter((item) => item.id === doc.id)
  } else {
    const foundIndex = existingItems.findIndex(
      (item) => item.asset.id === doc.id
    )
    const assetToInsert = convertAssetDocIntoCategoryItem(doc)

    if (foundIndex !== -1) {
      console.debug(`found asset - updating...`)
      newAssets[foundIndex] = assetToInsert
    } else {
      console.debug(`did not find asset - inserting...`)
      newAssets = newAssets.concat([assetToInsert])
    }
  }

  return existingCacheRef.set(
    {
      [ViewCacheCategoryFieldNames.assets]: newAssets,
      [ViewCacheFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}

async function hydrateViewCache(viewCacheName, doc) {
  switch (viewCacheName) {
    case ViewCacheNames.CategoryAccessory:
      return hydrateCategory(AssetCategories.accessory, doc)
  }
}
module.exports.hydrateViewCache = hydrateViewCache

async function syncCategoryCache(categoryName) {
  const existingCacheRef = db
    .collection(CollectionNames.ViewCache)
    .doc(`category-${categoryName}`)
  const existingCacheDoc = await existingCacheRef.get()
  const existingAssets =
    existingCacheDoc.get(ViewCacheCategoryFieldNames.assets) || []

  console.debug(
    `found ${existingAssets.length} assets already in cache "${categoryName}"`
  )

  const { docs: assetDocs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.category, Operators.EQUALS, categoryName)
    .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
    .get()

  console.debug(`found ${assetDocs.length} assets to insert into cache`)

  const newAssets = assetDocs.map(convertAssetDocIntoCategoryItem)

  return existingCacheRef.set(
    {
      [ViewCacheCategoryFieldNames.assets]: newAssets,
      [ViewCacheFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}

async function syncCategoryCaches() {
  const categoryNames = Object.values(AssetCategories)

  for (const categoryName of categoryNames) {
    console.debug(`syncing category cache "${categoryName}"`)
    await syncCategoryCache(categoryName)
  }
}

async function syncAllViewCaches() {
  await syncCategoryCaches()
}
module.exports.syncAllViewCaches = syncAllViewCaches
