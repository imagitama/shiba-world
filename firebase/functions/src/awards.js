const admin = require('firebase-admin')
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
    awardIdsToGive.push(allAwardIds['1_asset_approved'])
  }

  if (assetCount >= 2) {
    awardIdsToGive.push(allAwardIds['5_assets_approved'])
  }

  if (assetCount >= 20) {
    awardIdsToGive.push(allAwardIds['20_assets_approved'])
  }

  if (assetCount >= 100) {
    awardIdsToGive.push(allAwardIds['100_assets_approved'])
  }

  // hacky solution to getAwardIdsForUserId() not working
  if (awardIdsToGive.length) {
    awardIdsToGive.push(allAwardIds['1_year_anniversary'])
  }

  return awardIdsToGive
}
module.exports.getAwardIdsToGiveForAssetCount = getAwardIdsToGiveForAssetCount

async function getSignupDateById(userId) {
  const user = await admin.auth().getUser(userId)
  return user.metadata.creationTime
}

const dateTimeForAnniversary = '2021-05-01T00:00:00.000+08:00'

// this takes AGES and doesn't work so assuming they are all anniversary members for now
const getAwardIdsForUserId = async (userId) => {
  const signupDate = await getSignupDateById(userId)

  if (signupDate < new Date(dateTimeForAnniversary)) {
    return [allAwardIds['1_year_anniversary']]
  }

  return []
}
module.exports.getAwardIdsForUserId = getAwardIdsForUserId

const syncAwards = async () => {
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

  const { docs: allUserDocs } = await db.collection(CollectionNames.Users).get()

  console.debug(`found ${allUserDocs.length} users to check`)

  for (const userDoc of allUserDocs) {
    const userId = userDoc.id
    const total = userId in tallyByCreatorId ? tallyByCreatorId[userId] : 0

    let awardIdsToGive = []

    awardIdsToGive = awardIdsToGive.concat(
      getAwardIdsToGiveForAssetCount(total)
    )

    // awardIdsToGive = awardIdsToGive.concat(await getAwardIdsForUserId(userId))

    if (awardIdsToGive.length) {
      count++

      batch.set(db.collection(CollectionNames.AwardsForUsers).doc(userId), {
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
