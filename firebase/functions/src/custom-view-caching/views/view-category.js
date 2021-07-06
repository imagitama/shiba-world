const {
  CollectionNames,
  Operators,
  OrderDirections,
  AssetFieldNames,
  AssetCategories,
} = require('../../firebase')
const { map, test } = require('../entities/asset-results-item')

const getDefinition = ({ category, isAdult, fieldName, direction }) => ({
  sources: [
    {
      collectionName: CollectionNames.Assets,
      where: [
        [AssetFieldNames.category, Operators.EQUALS, category],
        [AssetFieldNames.isApproved, Operators.EQUALS, true],
        [AssetFieldNames.isDeleted, Operators.EQUALS, false],
        [AssetFieldNames.isPrivate, Operators.EQUALS, false],
      ].concat(
        isAdult === false
          ? [[AssetFieldNames.isAdult, Operators.EQUALS, false]]
          : []
      ),
      order: [fieldName, direction],
      map,
      test,
    },
  ],
})

for (const category of Object.values(AssetCategories)) {
  if (
    category === AssetCategories.avatar ||
    category === AssetCategories.article
  ) {
    continue
  }
  module.exports[`view-category-${category}_nsfw_title_asc`] = getDefinition({
    category,
    isAdult: true,
    fieldName: AssetFieldNames.title,
    direction: OrderDirections.ASC,
  })
  module.exports[`view-category-${category}_nsfw_title_desc`] = getDefinition({
    category,
    isAdult: true,
    fieldName: AssetFieldNames.title,
    direction: OrderDirections.DESC,
  })
  module.exports[`view-category-${category}_sfw_title_asc`] = getDefinition({
    category,
    isAdult: false,
    fieldName: AssetFieldNames.title,
    direction: OrderDirections.ASC,
  })
  module.exports[`view-category-${category}_sfw_title_desc`] = getDefinition({
    category,
    isAdult: false,
    fieldName: AssetFieldNames.title,
    direction: OrderDirections.DESC,
  })
  module.exports[
    `view-category-${category}_nsfw_createdAt_asc`
  ] = getDefinition({
    category,
    isAdult: true,
    fieldName: AssetFieldNames.createdAt,
    direction: OrderDirections.ASC,
  })
  module.exports[
    `view-category-${category}_nsfw_createdAt_desc`
  ] = getDefinition({
    category,
    isAdult: true,
    fieldName: AssetFieldNames.createdAt,
    direction: OrderDirections.DESC,
  })
  module.exports[`view-category-${category}_sfw_createdAt_asc`] = getDefinition(
    {
      category,
      isAdult: false,
      fieldName: AssetFieldNames.createdAt,
      direction: OrderDirections.ASC,
    }
  )
  module.exports[
    `view-category-${category}_sfw_createdAt_desc`
  ] = getDefinition({
    category,
    isAdult: false,
    fieldName: AssetFieldNames.createdAt,
    direction: OrderDirections.DESC,
  })
}
