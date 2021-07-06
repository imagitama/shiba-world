const {
  getHasArrayOfReferencesChanged,
  AssetFieldNames,
  Operators,
} = require('../../firebase')

module.exports.map = (item) => ({
  [AssetFieldNames.title]: item[AssetFieldNames.title].substr(0, 100),
  [AssetFieldNames.description]: item[AssetFieldNames.description].substr(
    0,
    100
  ),
  [AssetFieldNames.thumbnailUrl]: item[AssetFieldNames.thumbnailUrl],
  [AssetFieldNames.isAdult]: item[AssetFieldNames.isAdult],
  [AssetFieldNames.tags]: item[AssetFieldNames.tags],
  [AssetFieldNames.createdAt]: item[AssetFieldNames.createdAt],
  [AssetFieldNames.species]: item[AssetFieldNames.species],
})

module.exports.wherePublicSfw = [
  [AssetFieldNames.isApproved, Operators.EQUALS, true],
  [AssetFieldNames.isDeleted, Operators.EQUALS, false],
  [AssetFieldNames.isPrivate, Operators.EQUALS, false],
  [AssetFieldNames.isAdult, Operators.EQUALS, false],
]

module.exports.test = (itemBefore, itemAfter) => {
  if (itemBefore[AssetFieldNames.title] !== itemAfter[AssetFieldNames.title]) {
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
    itemBefore[AssetFieldNames.isAdult] !== itemAfter[AssetFieldNames.isAdult]
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
}
