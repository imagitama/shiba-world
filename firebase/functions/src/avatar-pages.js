const {
    db,
    CollectionNames,
    AssetFieldNames,
    Operators,
    AssetCategories,
    SpeciesFieldNames
} = require('./firebase')

const descriptionMaxLength = 100
const trimDescription = (desc) => desc.substr(0, descriptionMaxLength)

const slimSpecies = (docData) => ({
    id: docData.id,
    species: docData.ref,
    pageNumber: docData.pageNumber,
    avatarCount: docData.avatarCount,
    [SpeciesFieldNames.singularName]: docData[SpeciesFieldNames.singularName],
    [SpeciesFieldNames.pluralName]: docData[SpeciesFieldNames.pluralName],
    [SpeciesFieldNames.shortDescription]: docData[
      SpeciesFieldNames.shortDescription
    ],
    [SpeciesFieldNames.thumbnailUrl]: docData[SpeciesFieldNames.thumbnailUrl],
  })

  const slimAvatar = (docData) => ({
    id: docData.id,
    asset: docData.ref,
    speciesId: docData.speciesId,
    [AssetFieldNames.title]: docData[AssetFieldNames.title],
    [AssetFieldNames.description]: trimDescription(
      docData[AssetFieldNames.description]
  ),
    [AssetFieldNames.thumbnailUrl]: docData[AssetFieldNames.thumbnailUrl],
    // [AssetFieldNames.species]: docData[AssetFieldNames.species],
    [AssetFieldNames.isAdult]: docData[AssetFieldNames.isAdult],
    [AssetFieldNames.tags]: docData[AssetFieldNames.tags],
    [AssetFieldNames.createdAt]: docData[AssetFieldNames.createdAt],
  })

// NOTE: This returns all NSFW avatars too
// NOTE: This will take ages and is there is over 1000 results
const getAllPublicAvatars = async () => {
    const { docs } = await db.collection(CollectionNames.Assets)
        .where(AssetFieldNames.category, Operators.EQUALS, AssetCategories.avatar)
        .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
        .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
        .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
        .get()

    return docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }))
}

const getAllSpecies = async () => {
    const { docs } = await db.collection(CollectionNames.Species).get()
    return docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }))
}

const limitPerPage = 100

const splitAvatarsIntoPages = (avatars) => {
    let count = 0
    let currentPageNumber = 1
    const resultsByPageNumber = { [currentPageNumber]: [] }

    for (const avatarDoc of avatars) {
        count++

        resultsByPageNumber[currentPageNumber].push(avatarDoc)

        if (count === limitPerPage) {
            count = 0
            currentPageNumber++
            resultsByPageNumber[currentPageNumber] = []
        }
    }

    return resultsByPageNumber
}

const tallyAvatarsForSpecies = (species, avatarsByPageNumber) => {
  let tally = {}

  for (const [, avatars] of Object.entries(avatarsByPageNumber)) {
    for (const avatarDoc of avatars) {
      tally[avatarDoc.speciesId] = avatarDoc.speciesId in tally ? tally[avatarDoc.speciesId] + 1 : 1
    }
  }

  return tally
}

const addExtraSpeciesFields = (species, avatarsByPageNumber) => {
    const tallyBySpeciesId = tallyAvatarsForSpecies(species, avatarsByPageNumber)

    return species.map(item => {
        item.avatarCount = tallyBySpeciesId[item.id]

        for (const [pageNumber, avatars] of Object.entries(avatarsByPageNumber)) {
          for (const avatarDoc of avatars) {
            // uses a special prop we cheeky added earlier
            if (avatarDoc.speciesId === item.id) {
              item.pageNumber = pageNumber
              return item
            }
          }
        }
        return item
    })
}

const writePages = async (species, avatarsByPageNumber) => {
    const pageCount = Object.keys(avatarsByPageNumber).length

    const speciesWithExtra = addExtraSpeciesFields(species, avatarsByPageNumber)

    const slimmedSpecies = speciesWithExtra.map(slimSpecies)

    await db.collection('avatarPages').doc('summary').set({
        species: slimmedSpecies, 
        pageCount
    })

    for (const [pageNumber, avatars] of Object.entries(avatarsByPageNumber)) {
        const slimmedAvatars = avatars.map(slimAvatar)

        await db.collection('avatarPages').doc(`page${pageNumber}`).set({
            avatars: slimmedAvatars
        })
    }
}

const getSpeciesNameForId = (speciesId, species) => species.find(({ id }) => id === speciesId)[SpeciesFieldNames.pluralName]

const sortAvatarsBySpeciesName = (avatars, species) => {
  return avatars.sort((avatarA, avatarB) => {
    if (!avatarA.speciesId) {
      return -1
    }
    if (!avatarB.speciesId) {
      return -1
    }

      const avatarASpeciesName = getSpeciesNameForId(avatarA.speciesId, species)
      const avatarBSpeciesName = getSpeciesNameForId(avatarB.speciesId, species)
  
    return avatarASpeciesName.localeCompare(avatarBSpeciesName)
    })
}

const dupeAvatarsForEachSpecies = avatars => {
    const newAvatars = []

    for (const avatarDoc of avatars) {
        for (const speciesRef of avatarDoc[AssetFieldNames.species]) {
            // firebase doesnt let us clone doc snapshots
            // so just add a new cheeky prop on here
            // probably should use .data() on this and do it instead but nah
            const newDoc = { ...avatarDoc }
            newDoc.speciesId = speciesRef.id

            newAvatars.push(newDoc)
        }
    }

    return newAvatars
}

const syncAvatarPages = async () => {
    const publicAvatars = await getAllPublicAvatars()
    const avatarCount = publicAvatars.length

    console.debug(`found ${avatarCount} avatars`)

    const species = await getAllSpecies()
    const speciesCount = species.length
    
    console.debug(`found ${species.length} species`)

    const avatarsWithSpeciesDupes = dupeAvatarsForEachSpecies(publicAvatars)

    const sortedAssets = sortAvatarsBySpeciesName(avatarsWithSpeciesDupes, species)

    const assetsByPageNumber = splitAvatarsIntoPages(sortedAssets)

    const pageCount = Object.keys(assetsByPageNumber).length

    console.debug(`split into ${pageCount} pages (${limitPerPage} per page)`)

    await writePages(species, assetsByPageNumber)

    return {
        speciesCount,
        avatarCount,
        pageCount
    }
}
module.exports.syncAvatarPages = syncAvatarPages
