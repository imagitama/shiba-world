const {
  db,
  CollectionNames,
  specialCollectionIds,
  FeaturedAssetForUsersFieldNames,
  AssetFieldNames,
  AuthorFieldNames,
  UserFieldNames,
} = require('./firebase')

const SpecialFieldNames = {
  activeAsset: 'activeAsset',
  rotation: 'rotation',
  alreadyFeaturedAssets: 'alreadyFeaturedAssets',
}

const ActiveAssetFieldNames = {
  asset: 'asset',
}

// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function shuffle(a) {
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}

module.exports.syncFeaturedAssets = async () => {
  const featuredAssetsForUsersRefs = await db
    .collection(CollectionNames.FeaturedAssetsForUsers)
    .listDocuments()
  const featuredAssetsForUsers = await Promise.all(
    featuredAssetsForUsersRefs.map(async (ref) => ref.get())
  )

  const allFeaturedAssetRefs = featuredAssetsForUsers.reduce(
    (result, doc) =>
      doc.get(FeaturedAssetForUsersFieldNames.assets)
        ? result.concat(doc.get(FeaturedAssetForUsersFieldNames.assets))
        : result,
    []
  )

  const specialRef = db
    .collection(CollectionNames.Special)
    .doc(specialCollectionIds.featuredAssets)
  const specialDoc = await specialRef.get()

  await specialRef.set(
    {
      [SpecialFieldNames.rotation]: allFeaturedAssetRefs,
    },
    {
      merge: true,
    }
  )

  const activeAsset = specialDoc.get(SpecialFieldNames.activeAsset)

  // If no active asset at all OR the active one is no longer in rotation
  // (make sure this happens last)
  if (
    !activeAsset ||
    (activeAsset[ActiveAssetFieldNames.asset] &&
      !allFeaturedAssetRefs.find(
        (item) => item.id === activeAsset[ActiveAssetFieldNames.asset].id
      ))
  ) {
    await pickFeaturedAsset()
  }
}

const getAuthorName = async (authorRef) => {
  if (authorRef) {
    const author = await authorRef.get()
    const authorName = author.get(AuthorFieldNames.name)
    return authorName
  }
  return null
}

const getCreatedByName = async (authorRef, createdByRef) => {
  if (authorRef) {
    return null
  }

  const createdBy = await createdByRef.get()
  const createdByName = createdBy.get(UserFieldNames.username)
  return createdByName
}

const pickFeaturedAsset = async () => {
  console.debug('Picking featured asset')

  const specialRef = db
    .collection(CollectionNames.Special)
    .doc(specialCollectionIds.featuredAssets)
  const specialDoc = await specialRef.get()

  const rotation = specialDoc.get(SpecialFieldNames.rotation)
  let alreadyFeaturedAssets = specialDoc.get(
    SpecialFieldNames.alreadyFeaturedAssets
  )

  if (!alreadyFeaturedAssets) {
    alreadyFeaturedAssets = []
  }

  let remainingAssets = rotation.filter(
    (assetInRotation) =>
      !alreadyFeaturedAssets.find(
        (alreadyFeaturedAsset) => alreadyFeaturedAsset.id === assetInRotation.id
      )
  )

  console.debug(
    `There are ${remainingAssets.length} assets remaining in rotation (${alreadyFeaturedAssets.length} have been featured already)`
  )

  if (remainingAssets.length === 0) {
    console.debug('No assets remaining, using entire rotation as remaining...')
    remainingAssets = rotation
    alreadyFeaturedAssets = []
  }

  const randomizedAssets = shuffle(remainingAssets)

  let selectedAsset
  let selectedAssetDoc
  let updatedAlreadyFeaturedAssets = []

  if (randomizedAssets.length) {
    selectedAsset = randomizedAssets[0]
    selectedAssetDoc = await selectedAsset.get()

    updatedAlreadyFeaturedAssets = alreadyFeaturedAssets.concat([selectedAsset])

    console.debug(`Picked asset ${selectedAsset.id}`)
  } else {
    console.debug('No asset remaining to be picked: clearing')
  }

  await specialRef.set(
    {
      [SpecialFieldNames.alreadyFeaturedAssets]: updatedAlreadyFeaturedAssets,
      [SpecialFieldNames.activeAsset]: selectedAsset
        ? {
            // standard
            title: selectedAssetDoc.get(AssetFieldNames.title),
            description: selectedAssetDoc.get(AssetFieldNames.description),
            thumbnailUrl: selectedAssetDoc.get(AssetFieldNames.thumbnailUrl),

            // special
            asset: selectedAsset,
            authorName: await getAuthorName(
              selectedAssetDoc.get(AssetFieldNames.author)
            ),
            createdByName: await getCreatedByName(
              selectedAssetDoc.get(AssetFieldNames.author),
              selectedAssetDoc.get(AssetFieldNames.createdBy)
            ),
          }
        : null,
    },
    {
      merge: true,
    }
  )
}
module.exports.pickFeaturedAsset = pickFeaturedAsset
