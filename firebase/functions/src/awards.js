const {
  db,
  CollectionNames,
  AwardsForUsersFieldNames,
  AssetFieldNames,
  Operators,
} = require('./firebase')

const allAwardIds = {
  '1_year_anniversary': '1_year_anniversary',
  '1_asset_approved': '1_asset_approved',
  '5_assets_approved': '5_assets_approved',
  '20_assets_approved': '20_assets_approved',
  '100_assets_approved': '100_assets_approved',
}
module.exports.allAwardIds = allAwardIds

const insertAwardsForUser = async (awardIds, userId) => {
  const awardsForUserRef = db
    .collection(CollectionNames.AwardsForUsers)
    .doc(userId)
  await awardsForUserRef.set({
    [AwardsForUsersFieldNames.awards]: awardIds,
    [AwardsForUsersFieldNames.lastModifiedAt]: new Date(),
  })
}

const giveAward = async (awardId, userId) => {
  if (!awardId) {
    throw new Error('No award ID')
  }
  if (!userId) {
    throw new Error('No user ID')
  }

  const existingAwardsForUserRef = db
    .collection(CollectionNames.AwardsForUsers)
    .doc(userId)
  const existingAwardsForUserDoc = await existingAwardsForUserRef.get()

  if (!existingAwardsForUserDoc.exists) {
    console.debug(`user has no awards yet, inserting...`)
    return insertAwardsForUser([awardId], userId)
  }

  const existingAwardIds =
    existingAwardsForUserDoc.get(AwardsForUsersFieldNames.awards) || []

  if (existingAwardIds.includes(awardId)) {
    console.warn(
      `Cannot award "${awardId}" to user "${userId}": already has that award! Ignoring...`
    )
    return
  }

  return insertAwardsForUser([...existingAwardIds, awardId], userId)
}
module.exports.giveAward = giveAward

const giveAwards = async (awardIds, userId) => {
  if (!awardIds) {
    throw new Error('No award IDs')
  }
  if (!userId) {
    throw new Error('No user ID')
  }

  const existingAwardsForUserRef = db
    .collection(CollectionNames.AwardsForUsers)
    .doc(userId)
  const existingAwardsForUserDoc = await existingAwardsForUserRef.get()

  if (!existingAwardsForUserDoc.exists) {
    console.debug(`user has no awards yet, inserting...`)
    return insertAwardsForUser(awardIds, userId)
  }

  const existingAwardIds =
    existingAwardsForUserDoc.get(AwardsForUsersFieldNames.awards) || []
  const awardIdsToGive = []

  for (const awardId of awardIds) {
    if (existingAwardIds.includes(awardId)) {
      console.warn(
        `Cannot award "${awardId}" to user "${userId}": already has that award! Ignoring this award..`
      )
    } else {
      awardIdsToGive.push(awardId)
    }
  }

  return insertAwardsForUser([...existingAwardIds, ...awardIdsToGive], userId)
}
module.exports.giveAwards = giveAwards

const getNewAwardIds = (oldAwardIds, newAwardIds) =>
  newAwardIds.filter((id) => !oldAwardIds.includes(id))
module.exports.getNewAwardIds = getNewAwardIds

const getNameForAwardId = (awardId) => {
  switch (awardId) {
    case allAwardIds['1_year_anniversary']:
      return '1 Year Anniversary'
    case allAwardIds['1_asset_approved']:
      return 'Uploaded 1 Asset'
    case allAwardIds['5_assets_approved']:
      return 'Uploaded 5 Assets'
    case allAwardIds['20_assets_approved']:
      return 'Uploaded 20 Assets'
    case allAwardIds['100_assets_approved']:
      return 'Uploaded 100 Assets'
    default:
      throw new Error(`Cannot get name for award "${awardId}": unknown ID!`)
  }
}
module.exports.getNameForAwardId = getNameForAwardId

const getAwardIdsToGiveForAssetCount = (assetCount) => {
  let awardIdsToGive = []

  if (assetCount >= 1) {
    console.debug(`1 asset!`)
    awardIdsToGive.push(allAwardIds['1_asset_approved'])
  }

  if (assetCount >= 2) {
    console.debug(`5 assets!`)
    awardIdsToGive.push(allAwardIds['5_assets_approved'])
  }

  if (assetCount >= 20) {
    console.debug(`20 assets!`)
    awardIdsToGive.push(allAwardIds['20_assets_approved'])
  }

  if (assetCount >= 100) {
    console.debug(`100 assets!`)
    awardIdsToGive.push(allAwardIds['100_assets_approved'])
  }

  return awardIdsToGive
}
module.exports.getAwardIdsToGiveForAssetCount = getAwardIdsToGiveForAssetCount

const syncAwards = async () => {
  // get all assets
  // loop through each one
  // get creator
  // tally up
  // re-use code from other func to decide if to give award
  // add to batch and commit

  console.debug('syncing awards...')

  const { docs: approvedAssetDocs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .get()

  console.debug(`found ${approvedAssetDocs.length} approved assets`)

  const tallyByCreatorId = {}

  for (const assetDoc of approvedAssetDocs) {
    const creatorRef = assetDoc.get(AssetFieldNames.createdBy)

    tallyByCreatorId[creatorRef.id] = (tallyByCreatorId[creatorRef.id] || 0) + 1
  }

  const batch = db.batch()
  let count = 0

  for (const creatorId in tallyByCreatorId) {
    const total = tallyByCreatorId[creatorId]

    const awardIdsToGive = getAwardIdsToGiveForAssetCount(total)

    if (awardIdsToGive.length) {
      count++
      batch.set(db.collection(CollectionNames.AwardsForUsers).doc(creatorId), {
        [AwardsForUsersFieldNames.awards]: awardIdsToGive,
        [AwardsForUsersFieldNames.lastModifiedAt]: new Date(),
      })
    }
  }

  console.debug(`giving awards to ${count} users...`)

  await batch.commit()

  return {
    count,
  }
}
module.exports.syncAwards = syncAwards
