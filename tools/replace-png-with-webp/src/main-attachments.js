'use strict'

const admin = require('firebase-admin')
const { optimizeImage } = require('./optimizeImage')

admin.initializeApp()
const db = admin.firestore()
const isDryRun = !process.argv.includes('--no-dry')
const isDebugMode = process.argv.includes('--debug')

const CollectionNames = {
  Users: 'users',
  Assets: 'assets',
  Comments: 'comments',
  Notices: 'notices',
  History: 'history',
  Endorsements: 'endorsements',
  Profiles: 'profiles',
  Mail: 'mail',
  Summaries: 'summaries',
  Downloads: 'downloads',
  Requests: 'requests',
  Notifications: 'notifications',
  Polls: 'polls',
  PollResponses: 'pollResponses',
  GuestUsers: 'guestUsers',
  Authors: 'authors',
  DiscordServers: 'discordServers',
  Likes: 'likes',
  Species: 'species',
  Special: 'special',
}

const AssetFieldNames = {
  title: 'title',
  isAdult: 'isAdult',
  isApproved: 'isApproved',
  tags: 'tags',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isDeleted: 'isDeleted',
  category: 'category',
  species: 'species',
  sourceUrl: 'sourceUrl',
  videoUrl: 'videoUrl',
  isPrivate: 'isPrivate',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  thumbnailUrl: 'thumbnailUrl',
  fileUrls: 'fileUrls',
  description: 'description',
  authorName: 'authorName', // deprecated
  author: 'author',
  children: 'children',
  ownedBy: 'ownedBy',
  isPinned: 'isPinned',
  discordServer: 'discordServer',
  bannerUrl: 'bannerUrl',
  tutorialSteps: 'tutorialSteps',
  pedestalVideoUrl: 'pedestalVideoUrl',
  pedestalFallbackImageUrl: 'pedestalFallbackImageUrl',
  sketchfabEmbedUrl: 'sketchfabEmbedUrl',
}

const UserFieldNames = {
  username: 'username',
  isEditor: 'isEditor',
  isAdmin: 'isAdmin',
  enabledAdultContent: 'enabledAdultContent',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  avatarUrl: 'avatarUrl',
  createdBy: 'createdBy',
  createdAt: 'createdAt',
  isBanned: 'isBanned',
  banReason: 'banReason',
  isPatron: 'isPatron',
}

const AuthorFieldNames = {
  name: 'name',
  description: 'description',
  websiteUrl: 'websiteUrl',
  email: 'email',
  twitterUsername: 'twitterUsername',
  gumroadUsername: 'gumroadUsername',
  discordUsername: 'discordUsername',
  discordServerInviteUrl: 'discordServerInviteUrl',
  patreonUsername: 'patreonUsername',
  categories: 'categories',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  ownedBy: 'ownedBy',
  discordServerId: 'discordServerId',
  isOpenForCommission: 'isOpenForCommission',
  commissionInfo: 'commissionInfo',
  showCommissionStatusForAssets: 'showCommissionStatusForAssets',
  avatarUrl: 'avatarUrl',
  // fallbackAvatarUrl: 'fallbackAvatarUrl', REMOVED
  bannerUrl: 'bannerUrl',
  fallbackBannerUrl: 'fallbackBannerUrl',
}

const SpeciesFieldNames = {
  singularName: 'singularName',
  pluralName: 'pluralName',
  description: 'description',
  shortDescription: 'shortDescription',
  thumbnailUrl: 'thumbnailUrl',
  fallbackThumbnailUrl: 'fallbackThumbnailUrl',
  thumbnailSourceUrl: 'thumbnailSourceUrl',
  isPopular: 'isPopular',
  lastModifiedBy: 'lastModifiedBy',
  lastModifiedAt: 'lastModifiedAt',
  createdAt: 'createdAt',
  createdBy: 'createdBy',
  slug: 'slug',
}

async function getAllAssets() {
  return db.collection(CollectionNames.Assets).listDocuments()
}

async function getAllUsers() {
  return db.collection(CollectionNames.Users).listDocuments()
}

function isFallbackImageDefinition(thing) {
  return thing && typeof thing !== 'string' && (thing.url || thing.fallbackUrl)
}

function isPngImageUrl(url) {
  return url && typeof url === 'string' && url.includes('.png')
}

function isWebpImageUrl(url) {
  return url && typeof url === 'string' && url.includes('.webp')
}

function renamePngPathToWebp(pngPath) {
  return pngPath.replace('.png', '.webp')
}

async function convertPngToWebp(pngPath) {
  if (isDebugMode) {
    console.log(`Converting PNG to WEBP: ${pngPath}`)
  }

  if (!isDryRun) {
    return optimizeImage(pngPath)
  }

  return Promise.resolve()
}

const pngPathsToConvert = []

async function main() {
  try {
    console.log('Replacing PNG with WEBP...')

    if (isDryRun) {
      console.log('Is dry run!')
    }

    const allAssets = await getAllAssets()

    console.log(`Found all ${allAssets.length} assets`)

    const assetsToUpdateById = {}

    await Promise.all(
      allAssets.map(async (docRef) => {
        const doc = await docRef.get()
        const docData = {
          id: doc.id,
          ...doc.data(),
        }

        if (
          docData[AssetFieldNames.fileUrls] &&
          Array.isArray(docData[AssetFieldNames.fileUrls]) &&
          docData[AssetFieldNames.fileUrls].length > 0
        ) {
          const newUrls = docData[AssetFieldNames.fileUrls].map((url) => {
            if (isPngImageUrl(url)) {
              pngPathsToConvert.push(url)
              return renamePngPathToWebp(url)
            }
            return url
          })

          assetsToUpdateById[doc.id] = {
            [AssetFieldNames.fileUrls]: newUrls,
          }
        }
      })
    )

    console.log(`We need to convert ${pngPathsToConvert.length} PNGs to WEBPs`)

    for (const pngPath of pngPathsToConvert) {
      await convertPngToWebp(pngPath)
    }

    console.log(
      `We need to update ${Object.keys(assetsToUpdateById).length} assets`
    )

    let fieldsToUpdate
    let batch = db.batch()

    for (const assetId in assetsToUpdateById) {
      fieldsToUpdate = assetsToUpdateById[assetId]

      console.log(`Update asset ${assetId}`, fieldsToUpdate)

      const docRef = db.collection(CollectionNames.Assets).doc(assetId)

      batch.update(docRef, fieldsToUpdate, { merge: true })
    }

    if (!isDryRun) {
      await batch.commit()
    }

    console.log('Task complete')
    process.exit(1)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

main()
