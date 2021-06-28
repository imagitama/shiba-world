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

/**
 * The "avatars" category page is massive (over 1000 entries) and by far 
 * the most popular page on the site.
 * This file and the functions that use it is an attempt to "cache" the entries
 * into a couple of entries to minimize DB usage and costs.
 * 
 * This system is DEPRECATED and instead we are going to a more generic pagination
 * system.
 */

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

const descriptionMaxLength = 100
const trimDescription = (desc) => desc.substr(0, descriptionMaxLength)

const convertAvatarDocToAvatarListItem = (doc) => ({
  asset: doc.ref,
  [AssetFieldNames.title]: doc.get(AssetFieldNames.title),
  [AssetFieldNames.description]: trimDescription(
    doc.get(AssetFieldNames.description)
  ),
  [AssetFieldNames.thumbnailUrl]: doc.get(AssetFieldNames.thumbnailUrl),
  [AssetFieldNames.species]: doc.get(AssetFieldNames.species),
  [AssetFieldNames.isAdult]: doc.get(AssetFieldNames.isAdult),
  [AssetFieldNames.tags]: doc.get(AssetFieldNames.tags),
  [AssetFieldNames.createdAt]: doc.get(AssetFieldNames.createdAt),
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

  await setAvatarsInList(avatars)

  const { docs: speciesDocs } = await db
    .collection(CollectionNames.Species)
    .get()

  const species = speciesDocs.map(convertSpeciesDocIntoSpeciesForList)

  const summaryDocRef = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList)

  console.debug(`setting ${species.length} species in avatar list...`)

  await summaryDocRef.set(
    {
      [AvatarListFieldNames.species]: species,
      [AvatarListFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )

  console.debug(`done setting species`)

  return { count: avatars.length }
}
module.exports.syncAvatarList = syncAvatarList

// firebase docs have a 1mb limit so guess the max per document
const avatarsPerPage = 500

const getAllAvatarsInList = async () => {
  console.debug(`getting all avatars in summary...`)

  const summaryDocRef1 = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList)
  const summaryDoc1 = await summaryDocRef1.get()
  let summaryDoc1Avatars = []

  if (summaryDoc1.exists) {
    summaryDoc1Avatars = summaryDoc1.get(AvatarListFieldNames.avatars)
  }

  const summaryDocRef2 = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList1)
  const summaryDoc2 = await summaryDocRef2.get()
  let summaryDoc2Avatars = []

  if (summaryDoc2.exists) {
    summaryDoc2Avatars = summaryDoc2.get(AvatarListFieldNames.avatars)
  }

  const summaryDocRef3 = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList2)
  const summaryDoc3 = await summaryDocRef3.get()
  let summaryDoc3Avatars = []

  if (summaryDoc3.exists) {
    summaryDoc3Avatars = summaryDoc3.get(AvatarListFieldNames.avatars)
  }

  const allAvatars = summaryDoc1Avatars
    .concat(summaryDoc2Avatars)
    .concat(summaryDoc3Avatars)

  console.debug(`found ${allAvatars.length} avatars in summary`)

  return allAvatars
}

const setAvatarsInList = async (newAvatarList) => {
  console.debug(`setting ${newAvatarList.length} avatars in summary...`)

  const avatarsForPage1 = newAvatarList.slice(0, avatarsPerPage - 1)

  console.debug(`setting ${avatarsForPage1.length} avatars for page 1`)

  const summaryDocRef1 = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList)
  await summaryDocRef1.set(
    {
      [AvatarListFieldNames.avatars]: avatarsForPage1,
      [AvatarListFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )

  const avatarsForPage2 = newAvatarList.slice(
    avatarsPerPage,
    avatarsPerPage * 2 - 1
  )

  console.debug(`setting ${avatarsForPage2.length} avatars for page 2`)

  const summaryDocRef2 = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList1)
  await summaryDocRef2.set(
    {
      [AvatarListFieldNames.avatars]: avatarsForPage2,
      [AvatarListFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )

  const avatarsForPage3 = newAvatarList.slice(
    avatarsPerPage * 2,
    avatarsPerPage * 3 - 1
  )

  console.debug(`setting ${avatarsForPage3.length} avatars for page 3`)

  const summaryDocRef3 = db
    .collection(CollectionNames.Summaries)
    .doc(specialCollectionIds.avatarList2)
  await summaryDocRef3.set(
    {
      [AvatarListFieldNames.avatars]: avatarsForPage3,
      [AvatarListFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )

  console.debug('done setting avatars in summary')
}

module.exports.updateAvatarInList = async (assetId, avatarDoc) => {
  const existingAvatars = await getAllAvatarsInList()

  const foundIndex = existingAvatars.findIndex(
    (existingAvatar) => existingAvatar.asset.id === assetId
  )
  let updatedAvatars = [...existingAvatars]

  if (foundIndex !== -1) {
    console.debug(`avatar already in list`)

    if (avatarDoc.get(AssetFieldNames.isPrivate) === true) {
      console.debug(`avatar is marked as private - removing...`)
      updatedAvatars.splice(foundIndex, 1)
      console.debug(`there are now ${updatedAvatars.length} avatars`)
    } else {
      console.debug('updating...')
      updatedAvatars[foundIndex] = convertAvatarDocToAvatarListItem(avatarDoc)
    }
  } else {
    console.debug(`avatar NOT in list`)

    if (avatarDoc.get(AssetFieldNames.isPrivate) === true) {
      console.debug(`avatar is marked as private - not adding`)
    } else {
      console.debug('adding...')
      updatedAvatars = updatedAvatars.concat([
        convertAvatarDocToAvatarListItem(avatarDoc),
      ])
    }
  }

  await setAvatarsInList(updatedAvatars)
}
