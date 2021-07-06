const {
  CollectionNames,
  Operators,
  OrderDirections,
  AssetFieldNames,
  SpeciesFieldNames,
  AssetCategories,
  getHasArrayOfReferencesChanged,
} = require('../../firebase')

const getView = (includeAdult, bySpecies, orderDir) => ({
  sources: [
    {
      collectionName: CollectionNames.Assets,
      where: [
        [AssetFieldNames.category, Operators.EQUALS, AssetCategories.avatar],
        [AssetFieldNames.isApproved, Operators.EQUALS, true],
        [AssetFieldNames.isDeleted, Operators.EQUALS, false],
        [AssetFieldNames.isPrivate, Operators.EQUALS, false],
      ].concat(
        includeAdult === false
          ? [[AssetFieldNames.isAdult, Operators.EQUALS, false]]
          : []
      ),
      order: [AssetFieldNames.createdAt, orderDir],
      map: (item, index, { addUnmappedItem }) => {
        const mappedItemWithoutSpecies = {
          [AssetFieldNames.title]: item[AssetFieldNames.title].substr(0, 100),
          [AssetFieldNames.description]: item[
            AssetFieldNames.description
          ].substr(0, 100),
          [AssetFieldNames.thumbnailUrl]: item[AssetFieldNames.thumbnailUrl],
          [AssetFieldNames.isAdult]: item[AssetFieldNames.isAdult],
          [AssetFieldNames.tags]: item[AssetFieldNames.tags],
          [AssetFieldNames.createdAt]: item[AssetFieldNames.createdAt],
        }

        if (!bySpecies) {
          return {
            ...mappedItemWithoutSpecies,
            [AssetFieldNames.species]: item[AssetFieldNames.species],
          }
        } else {
          if (item[AssetFieldNames.species].length === 0) {
            return {
              ...mappedItemWithoutSpecies,
              [AssetFieldNames.species]: [],
            }
          }

          if (item[AssetFieldNames.species].length > 1) {
            const extraSpeciesRefs = item[AssetFieldNames.species].slice(1)
            for (const extraSpeciesRef of extraSpeciesRefs) {
              addUnmappedItem({
                ...item,
                [AssetFieldNames.species]: [extraSpeciesRef],
              })
            }
          }

          return {
            ...mappedItemWithoutSpecies,
            [AssetFieldNames.species]: item[AssetFieldNames.species].slice(
              0,
              1
            ),
          }
        }
      },
      test: (itemBefore, itemAfter) => {
        if (
          itemBefore[AssetFieldNames.title] !== itemAfter[AssetFieldNames.title]
        ) {
          return false
        }
        if (
          itemBefore[AssetFieldNames.description] !==
          itemAfter[AssetFieldNames.description]
        ) {
          return false
        }
        if (
          itemBefore[AssetFieldNames.thumbnailUrl] !==
          itemAfter[AssetFieldNames.thumbnailUrl]
        ) {
          return false
        }
        if (
          itemBefore[AssetFieldNames.isAdult] !==
          itemAfter[AssetFieldNames.isAdult]
        ) {
          return false
        }
        if (
          getHasArrayOfReferencesChanged(
            itemBefore[AssetFieldNames.species],
            itemAfter[AssetFieldNames.species]
          )
        ) {
          return false
        }
        return true
      },
    },
  ],
  summary: {
    sources: [
      {
        fieldName: 'species',
        collectionName: CollectionNames.Species,
        filter: (item, i, { pages }) => {
          return getTallyForSpeciesId(item.id, pages) > 0
        },
        map: (item, i, { pages }) => {
          return {
            pageNumber: getPageNumberForSpeciesId(item.id, pages),
            avatarCount: getTallyForSpeciesId(item.id, pages),
            [SpeciesFieldNames.singularName]:
              item[SpeciesFieldNames.singularName],
            [SpeciesFieldNames.pluralName]: item[SpeciesFieldNames.pluralName],
            [SpeciesFieldNames.shortDescription]:
              item[SpeciesFieldNames.shortDescription],
            [SpeciesFieldNames.thumbnailUrl]:
              item[SpeciesFieldNames.thumbnailUrl],
          }
        },
      },
    ],
  },
})

module.exports.nsfw_species = getView(true, true)
module.exports.nsfw_date_asc = getView(true, false, OrderDirections.ASC)
module.exports.nsfw_date_desc = getView(true, false, OrderDirections.DESC)
module.exports.sfw_species = getView(false, true)
module.exports.sfw_date_asc = getView(false, false, OrderDirections.ASC)
module.exports.sfw_date_desc = getView(false, false, OrderDirections.DESC)

const getTallyForSpeciesId = (speciesId, avatarsByPageNumber) => {
  let tally = 0

  for (const [, avatars] of Object.entries(avatarsByPageNumber)) {
    for (const avatarDoc of avatars) {
      if (
        avatarDoc[AssetFieldNames.species].length > 0 &&
        avatarDoc[AssetFieldNames.species][0].id === speciesId
      ) {
        tally = tally + 1
      }
    }
  }

  return tally
}

const getPageNumberForSpeciesId = (speciesId, avatarsByPageNumber) => {
  for (const [pageNumber, avatars] of Object.entries(avatarsByPageNumber)) {
    for (const avatarDoc of avatars) {
      if (
        avatarDoc[AssetFieldNames.species].length > 0 &&
        avatarDoc[AssetFieldNames.species][0].id === speciesId
      ) {
        return pageNumber
      }
    }
  }
}
