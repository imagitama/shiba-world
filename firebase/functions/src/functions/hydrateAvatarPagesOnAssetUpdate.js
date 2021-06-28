const functions = require('firebase-functions')
const {
  isApproved,
  AssetFieldNames,
  AssetCategories,
  getHasArrayOfStringsChanged,
  CollectionNames,
} = require('../firebase')
const { syncAvatarPages } = require('../avatar-pages')

const getDoesAssetNeedToBeSynced = (beforeDocData, afterDocData) => {
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

  if (
    getHasArrayOfStringsChanged(
      beforeDocData[AssetFieldNames.tags],
      afterDocData[AssetFieldNames.tags]
    )
  ) {
    return true
  }

  if (
    beforeDocData[AssetFieldNames.isPrivate] !==
    afterDocData[AssetFieldNames.isPrivate]
  ) {
    return true
  }

  return false
}

module.exports = functions.firestore
  .document(`${CollectionNames.Assets}/{id}`)
  .onUpdate(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()

    if (isApproved(afterDocData)) {
      console.debug('asset is approved')
      if (getDoesAssetNeedToBeSynced(beforeDocData, afterDocData)) {
        console.debug('avatar needs to be synced')
        
        // rebuilding every page on a tiny asset update is not efficient
        // but for now it works
        return syncAvatarPages()
      } else {
        console.debug('asset is not ready to be synced')
      }
    } else {
      console.debug('asset not approved yet')
    }

    return Promise.resolve()
  })
