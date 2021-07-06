const {
  AssetFieldNames,
  OrderDirections,
  CollectionNames,
  Operators,
} = require('../../firebase')
const { map, test } = require('../entities/asset-results-item')

const getDefinition = ({ fieldName, direction }) => ({
  sources: [
    {
      collectionName: CollectionNames.Assets,
      where: [
        [AssetFieldNames.isApproved, Operators.EQUALS, true],
        [AssetFieldNames.isDeleted, Operators.EQUALS, false],
        [AssetFieldNames.isPrivate, Operators.EQUALS, false],
        [AssetFieldNames.isAdult, Operators.EQUALS, true],
      ],
      order: [fieldName, direction],
      map,
      test,
    },
  ],
})

module.exports['view-adult-assets_title_asc'] = getDefinition({
  fieldName: AssetFieldNames.title,
  direction: OrderDirections.ASC,
})
module.exports['view-adult-assets_title_desc'] = getDefinition({
  fieldName: AssetFieldNames.title,
  direction: OrderDirections.DESC,
})

module.exports['view-adult-assets_createdAt_asc'] = getDefinition({
  fieldName: AssetFieldNames.createdAt,
  direction: OrderDirections.ASC,
})
module.exports['view-adult-assets_createdAt_desc'] = getDefinition({
  fieldName: AssetFieldNames.createdAt,
  direction: OrderDirections.DESC,
})
