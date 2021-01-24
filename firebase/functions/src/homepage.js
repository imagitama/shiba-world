const {
  db,
  CollectionNames,
  AssetFieldNames,
  UserFieldNames,
  Operators,
  specialCollectionIds,
  AssetCategories,
} = require('./firebase')

const HomepageFieldNames = {
  lastUpdatedAt: 'lastUpdatedAt',
  siteStats: 'siteStats',
  patreon: 'patreon',
}

const HomepageSiteStatsFieldNames = {
  numAssets: 'numAssets',
  numAvatars: 'numAvatars',
  numAccessories: 'numAccessories',
  numUsers: 'numUsers',
}

const HomepagePatreonFieldNames = {
  numConnectedToPatreon: 'numConnectedToPatreon',
}

async function syncStats() {
  const { size: numAssets } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .get()
  const { size: numAvatars } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.category, Operators.EQUALS, AssetCategories.avatar)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .get()
  const { size: numAccessories } = await db
    .collection(CollectionNames.Assets)
    .where(
      AssetFieldNames.category,
      Operators.EQUALS,
      AssetCategories.accessory
    )
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .get()
  const { size: numUsers } = await db.collection(CollectionNames.Users).get()

  return {
    [HomepageSiteStatsFieldNames.numAssets]: numAssets,
    [HomepageSiteStatsFieldNames.numAvatars]: numAvatars,
    [HomepageSiteStatsFieldNames.numAccessories]: numAccessories,
    [HomepageSiteStatsFieldNames.numUsers]: numUsers,
  }
}

async function syncPatreon() {
  const { size: numConnectedToPatreon } = await db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.isPatron, Operators.EQUALS, true)
    .get()

  return {
    [HomepagePatreonFieldNames.numConnectedToPatreon]: numConnectedToPatreon,
  }
}

async function writeHomepageDoc(data) {
  return db
    .collection(CollectionNames.Special)
    .doc(specialCollectionIds.homepage)
    .set({
      ...data,
      [HomepageFieldNames.lastUpdatedAt]: new Date(),
    })
}

module.exports.syncHomepage = async () => {
  const siteStats = await syncStats()
  const patreon = await syncPatreon()

  await writeHomepageDoc({
    [HomepageFieldNames.siteStats]: siteStats,
    [HomepageFieldNames.patreon]: patreon,
  })
}
