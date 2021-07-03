const {
  CollectionNames,
  AssetFieldNames,
  AssetCategories,
  OrderDirections,
  Operators,
} = require('../firebase')
const { map, test } = require('./mappers/asset-results-item')

const getDefinition = ({ isAdult, direction }) => ({
  sources: [
    {
      collectionName: CollectionNames.Assets,
      where: [
        [AssetFieldNames.category, Operators.EQUALS, AssetCategories.article],
        [AssetFieldNames.isApproved, Operators.EQUALS, true],
        [AssetFieldNames.isDeleted, Operators.EQUALS, false],
        [AssetFieldNames.isPrivate, Operators.EQUALS, false],
      ].concat(
        isAdult === false
          ? [[AssetFieldNames.isAdult, Operators.EQUALS, false]]
          : []
      ),
      order: [AssetFieldNames.createdAt, direction],
      map,
      test,
    },
  ],
})

module.exports['news_sfw_createdAt_asc'] = getDefinition({
  isAdult: false,
  direction: OrderDirections.ASC,
})
module.exports['news_sfw_createdAt_desc'] = getDefinition({
  isAdult: false,
  direction: OrderDirections.DESC,
})
module.exports['news_nsfw_createdAt_asc'] = getDefinition({
  isAdult: true,
  direction: OrderDirections.ASC,
})
module.exports['news_nsfw_createdAt_desc'] = getDefinition({
  isAdult: true,
  direction: OrderDirections.DESC,
})
