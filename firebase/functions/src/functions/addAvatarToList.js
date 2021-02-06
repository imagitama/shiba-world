const functions = require('firebase-functions')
const {
  isApproved,
  updateAvatarInList,
  AssetFieldNames,
  AssetCategories,
} = require('../firebase')

const assetNeedsToBeSynced = (beforeDocData, afterDocData) => {
  if (afterDocData[AssetFieldNames.category] !== AssetCategories.avatar) {
    return false
  }
  if (
    beforeDocData[AssetFieldNames.title] !== afterDocData[AssetFieldNames.title]
  ) {
    return true
  }
  if (
    beforeDocData[AssetFieldNames.description] !==
    afterDocData[AssetFieldNames.description]
  ) {
    return true
  }
  if (
    beforeDocData[AssetFieldNames.thumbnailUrl] !==
    afterDocData[AssetFieldNames.thumbnailUrl]
  ) {
    return true
  }
  for (const speciesRef of beforeDocData[AssetFieldNames.species]) {
    // if species removed
    if (
      !afterDocData[AssetFieldNames.species].find(
        (item) => item.id === speciesRef.id
      )
    ) {
      console.debug(`removed species ${speciesRef.id}`)
      return true
    }
  }
  for (const speciesRef of afterDocData[AssetFieldNames.species]) {
    // if species added
    if (
      !beforeDocData[AssetFieldNames.species].find(
        (item) => item.id === speciesRef.id
      )
    ) {
      console.debug(`added species ${speciesRef.id}`)
      return true
    }
  }
  return false
}

module.exports = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()

    if (isApproved(beforeDocData, afterDocData)) {
      console.debug('asset is approved')
      if (assetNeedsToBeSynced(beforeDocData, afterDocData)) {
        console.debug('avatar needs to be synced')
        return updateAvatarInList(afterDoc.id, afterDoc)
      } else {
        console.debug('asset is not ready to be synced')
      }
    } else {
      console.debug('asset not approved yet')
    }

    return Promise.resolve()
  })
