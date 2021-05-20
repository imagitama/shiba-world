const functions = require('firebase-functions')
const {
  AssetFieldNames,
  db,
  CollectionNames,
  Operators,
  hasAssetJustBeenApproved,
} = require('../firebase')
const { giveAwards, getAwardIdsToGiveForAssetCount } = require('../awards')

const awardCreatorIfNeeded = async (createdByRef) => {
  // get all assets by creator (not owner)
  // if total matches tier
  // give award
  // keep going until all tiers are met

  if (!createdByRef) {
    throw new Error(
      `Cannot award creator: no creator given! This should not happen!`
    )
  }

  // NOTE: This includes deleted assets
  const { docs: assetsByUserDocs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.createdBy, Operators.EQUALS, createdByRef)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .get()

  const awardIdsToGive = getAwardIdsToGiveForAssetCount(assetsByUserDocs.length)

  if (awardIdsToGive.length) {
    console.debug(
      `we need to give the creator some awards: ${awardIdsToGive.join(', ')}`
    )
    await giveAwards(awardIdsToGive, createdByRef.id)
  }
}

module.exports = functions.firestore
  .document('assets/{assetId}')
  .onUpdate(async ({ before: beforeDoc, after: afterDoc }) => {
    const beforeDocData = beforeDoc.data()
    const afterDocData = afterDoc.data()

    if (hasAssetJustBeenApproved(beforeDocData, afterDocData)) {
      await awardCreatorIfNeeded(afterDocData[AssetFieldNames.createdBy])
    }

    return Promise.resolve()
  })
