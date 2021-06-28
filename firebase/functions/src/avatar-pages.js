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

const slimSpecies = (doc) => ({
    id: doc.id,
    species: doc.ref,
    pageNumber: doc.pageNumber, // assuming this is already set
    [SpeciesFieldNames.singularName]: doc.get(SpeciesFieldNames.singularName),
    [SpeciesFieldNames.pluralName]: doc.get(SpeciesFieldNames.pluralName),
    [SpeciesFieldNames.shortDescription]: doc.get(
      SpeciesFieldNames.shortDescription
    ),
    [SpeciesFieldNames.thumbnailUrl]: doc.get(SpeciesFieldNames.thumbnailUrl),
  })

  const slimAvatar = (doc) => ({
    id: doc.id,
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

// NOTE: This returns all NSFW avatars too
// NOTE: This will take ages and is there is over 1000 results
const getAllPublicAvatars = async () => {
    const { docs } = await db.collection(CollectionNames.Assets)
        .where(AssetFieldNames.category, Operators.EQUALS, AssetCategories.avatar)
        .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
        .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
        .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
        .get()

    return docs
}

const getAllSpecies = async () => {
    const { docs } = await db.collection(CollectionNames.Species).get()
    return docs
}

const sortAvatarsInSpeciesIds = (avatars) => {
    const results = {}

    for (const avatarDoc of avatars) {
        const speciesForAvatar = avatarDoc.get(AssetFieldNames.species) || []

        for (const speciesItem of speciesForAvatar) {
            if (speciesItem.id in results) {
                results[speciesItem.id].push(avatarDoc) 
            } else {
                results[speciesItem.id] = [avatarDoc]
            }
        }
    }

    return results
}

// it's weird splitting a species across multiple pages
// so /probably/ better to have X species per page and pray each species
// is not 100s of avatars!
const limitOfSpeciesPerPage = 10

const splitAvatarsBySpeciesIdIntoPages = (avatarsBySpeciesId) => {
    let count = 0
    let currentPageNumber = 1
    const resultsByPageNumber = { [currentPageNumber]: {} }

    for (const [speciesId, avatarDocs] of Object.entries(avatarsBySpeciesId)) {
        count++

        resultsByPageNumber[currentPageNumber][speciesId] = avatarDocs

        if (count === limitOfSpeciesPerPage) {
            count = 0
            currentPageNumber++
            resultsByPageNumber[currentPageNumber] = {}
        }
    }

    return resultsByPageNumber
}

const getSpeciesWithPageNumbers = (species, pages) => {
    return species.map(item => {
        for (const [pageNumber, avatarsBySpeciesId] of Object.entries(pages)) {
            if (item.id in avatarsBySpeciesId) {
                item.pageNumber = pageNumber
            }
        }
        return item
    })
}

const writePages = async (species, pages) => {
    const pageCount = Object.keys(pages).length

    const speciesWithPageNumbers = getSpeciesWithPageNumbers(species, pages)

    const slimmedSpecies = speciesWithPageNumbers.map(slimSpecies)

    await db.collection('avatarPages').doc('summary').set({
        speciesWithPageNumbers: slimmedSpecies, 
        pageCount
    })

    for (const [pageNumber, avatarsBySpecies] of Object.entries(pages)) {
        const slimmedAvatarsBySpecies = {}

        for (const [speciesId, avatars] of Object.entries(avatarsBySpecies)) {
            const slimmedAvatars = avatars.map(slimAvatar)

            slimmedAvatarsBySpecies[speciesId] = slimmedAvatars
        }

        await db.collection('avatarPages').doc(`page${pageNumber}`).set({
            avatarsBySpeciesId: slimmedAvatarsBySpecies
        })
    }
}

const syncAvatarPages = async () => {
    const publicAvatars = await getAllPublicAvatars()
    const avatarCount = publicAvatars.length

    console.debug(`found ${avatarCount} avatars`)

    const species = await getAllSpecies()
    const speciesCount = species.length
    
    console.debug(`found ${species.length} species`)

    const publicAvatarsBySpeciesId = sortAvatarsInSpeciesIds(publicAvatars)

    const pagesByPageNumberThenBySpeciesId = splitAvatarsBySpeciesIdIntoPages(publicAvatarsBySpeciesId)

    const pageCount = Object.keys(pagesByPageNumberThenBySpeciesId).length

    console.debug(`split into ${pageCount} pages (${limitOfSpeciesPerPage} per page)`)

    await writePages(species, pagesByPageNumberThenBySpeciesId)

    return {
        speciesCount,
        avatarCount,
        pageCount
    }
}
module.exports.syncAvatarPages = syncAvatarPages
