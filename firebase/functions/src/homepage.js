const {
  db,
  CollectionNames,
  AssetFieldNames,
  UserFieldNames,
  Operators,
  specialCollectionIds,
  AssetCategories,
  OrderDirections,
  AuthorFieldNames,
} = require('./firebase')

const HomepageFieldNames = {
  lastUpdatedAt: 'lastUpdatedAt',
  siteStats: 'siteStats',
  patreon: 'patreon',
  assets: 'assets',
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

const HomepageAssetsFieldNames = {
  mostRecentArticle: 'mostRecentArticle',
  mostRecentAvatar: 'mostRecentAvatar',
  mostRecentAccessory: 'mostRecentAccessory',
}

async function getMostRecentDocDataForCategory(category) {
  const { docs } = await db
    .collection(CollectionNames.Assets)
    .where(AssetFieldNames.category, Operators.EQUALS, category)
    .where(AssetFieldNames.isApproved, Operators.EQUALS, true)
    .where(AssetFieldNames.isPrivate, Operators.EQUALS, false)
    .where(AssetFieldNames.isAdult, Operators.EQUALS, false)
    .where(AssetFieldNames.isDeleted, Operators.EQUALS, false)
    .limit(1)
    .orderBy(AssetFieldNames.createdAt, OrderDirections.DESC)
    .get()

  if (docs.length) {
    const mostRecentDoc = docs[0]

    const authorRef = mostRecentDoc.get(AssetFieldNames.author)
    const createdByRef = mostRecentDoc.get(AssetFieldNames.createdBy)

    let authorName = null
    let createdByName = null

    if (authorRef) {
      const author = await authorRef.get()
      authorName = author.get(AuthorFieldNames.name)
    } else {
      const createdBy = await createdByRef.get()
      createdByName = createdBy.get(UserFieldNames.username)
    }

    return {
      id: mostRecentDoc.id,

      // standard
      [AssetFieldNames.title]: mostRecentDoc.get(AssetFieldNames.title),
      [AssetFieldNames.description]: mostRecentDoc.get(
        AssetFieldNames.description
      ),
      [AssetFieldNames.thumbnailUrl]: mostRecentDoc.get(
        AssetFieldNames.thumbnailUrl
      ),
      [AssetFieldNames.createdAt]: mostRecentDoc.get(AssetFieldNames.createdAt),

      // special
      authorName,
      createdByName,
    }
  }

  return null
}

async function syncAssets() {
  return {
    [HomepageAssetsFieldNames.mostRecentArticle]: await getMostRecentDocDataForCategory(
      AssetCategories.article
    ),
    [HomepageAssetsFieldNames.mostRecentAvatar]: await getMostRecentDocDataForCategory(
      AssetCategories.avatar
    ),
    [HomepageAssetsFieldNames.mostRecentAccessory]: await getMostRecentDocDataForCategory(
      AssetCategories.accessory
    ),
  }
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
  const assets = await syncAssets()

  await writeHomepageDoc({
    [HomepageFieldNames.siteStats]: siteStats,
    [HomepageFieldNames.patreon]: patreon,
    [HomepageFieldNames.assets]: assets,
  })
}
