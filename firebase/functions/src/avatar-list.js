const {
  db,
  CollectionNames,
  AvatarListFieldNames,
  specialCollectionIds,
  SpeciesFieldNames,
  AssetFieldNames,
  Operators,
  AssetCategories,
} = require('./firebase')

const convertSpeciesDocIntoSpeciesForList = (doc) => ({
  id: doc.id,
  species: doc.ref,
  [SpeciesFieldNames.singularName]: doc.get(SpeciesFieldNames.singularName),
  [SpeciesFieldNames.shortDescription]: doc.get(
    SpeciesFieldNames.shortDescription
  ),
  [SpeciesFieldNames.thumbnailUrl]: doc.get(SpeciesFieldNames.thumbnailUrl),
})

module.exports.hydrateAvatarListWithSpeciesDoc = async (speciesDoc) => {
  const existingSummaryRef = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList)
  const existingSummaryDoc = await existingSummaryRef.get()

  const existingSpecies =
    existingSummaryDoc.get(AvatarListFieldNames.species) || []
  let newSpecies = [...existingSpecies]

  const foundSpeciesIdx = existingSpecies.findIndex(
    (speciesItem) => speciesItem.id === speciesDoc.id
  )
  const speciesValue = convertSpeciesDocIntoSpeciesForList(speciesDoc)

  if (foundSpeciesIdx !== -1) {
    newSpecies[foundSpeciesIdx] = speciesValue
  } else {
    newSpecies = newSpecies.concat([speciesValue])
  }

  return existingSummaryRef.set(
    {
      [AvatarListFieldNames.species]: newSpecies,
      [AvatarListFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}

const convertAvatarDocToAvatarListItem = (doc) => ({
  asset: doc.ref,
  [AssetFieldNames.title]: doc.get(AssetFieldNames.title),
  [AssetFieldNames.description]: doc.get(AssetFieldNames.description),
  [AssetFieldNames.thumbnailUrl]: doc.get(AssetFieldNames.thumbnailUrl),
  [AssetFieldNames.species]: doc.get(AssetFieldNames.species),
  [AssetFieldNames.isAdult]: doc.get(AssetFieldNames.isAdult),
})

const syncAvatarList = async () => {
  const { docs: avatarDocs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.category, Operators.EQUALS, AssetCategories.avatar)
    .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
    .get()

  const avatars = avatarDocs.map(convertAvatarDocToAvatarListItem)

  console.debug(`found ${avatars.length} avatars`)

  const { docs: speciesDocs } = await db
    .collection(CollectionNames.Species)
    .get()

  const species = speciesDocs.map(convertSpeciesDocIntoSpeciesForList)

  console.debug(`found ${species.length} species`)

  const summaryDocRef = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList)

  await summaryDocRef.set({
    [AvatarListFieldNames.avatars]: avatars,
    [AvatarListFieldNames.species]: species,
    [AvatarListFieldNames.lastModifiedAt]: new Date(),
  })
}
module.exports.syncAvatarList = syncAvatarList

module.exports.updateAvatarInList = async (assetId, avatarDoc) => {
  const summaryDocRef = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList)
  const summaryDoc = await summaryDocRef.get()

  if (!summaryDoc.exists) {
    console.debug('avatar list summary does not exist - syncing')
    await syncAvatarList()
  } else {
    const existingAvatars = summaryDoc.get(AvatarListFieldNames.avatars)
    const foundIndex = existingAvatars.findIndex(
      (existingAvatar) => existingAvatar.asset.id === assetId
    )
    let updatedAvatars = [...existingAvatars]

    console.debug(`found ${existingAvatars.length} existing avatars in list`)

    if (foundIndex !== -1) {
      console.debug(`avatar already in list - updating`)
      updatedAvatars[foundIndex] = convertAvatarDocToAvatarListItem(avatarDoc)
    } else {
      console.debug(`avatar NOT in list - adding`)
      updatedAvatars = updatedAvatars.concat([
        convertAvatarDocToAvatarListItem(avatarDoc),
      ])
    }

    await summaryDocRef.set({
      [AvatarListFieldNames.avatars]: updatedAvatars,
      [AvatarListFieldNames.lastModifiedAt]: new Date(),
    })
  }
}
