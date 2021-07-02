const config = require('./src/config')
const { cacheViews, rebuildAllViewCaches } = require('./src/view-cache')

exports.onAssetCreated = require('./src/functions/onAssetCreated')
exports.onAssetUpdated = require('./src/functions/onAssetUpdated')
exports.onCommentCreated = require('./src/functions/onCommentCreated')
exports.onLikeCreated = require('./src/functions/onLikeCreated')
exports.onUserUpdated = require('./src/functions/onUserUpdated')
exports.onUserSignup = require('./src/functions/onUserSignup')
exports.onProfileUpdated = require('./src/functions/onProfileUpdated')
exports.onRequestCreated = require('./src/functions/onRequestCreated')
exports.onRequestEdited = require('./src/functions/onRequestEdited')
exports.onAuthorCreated = require('./src/functions/onAuthorCreated')
exports.onAuthorEdited = require('./src/functions/onAuthorEdited')
exports.onTweetCreated = require('./src/functions/onTweetCreated')
exports.syncDiscordServerById = require('./src/functions/syncDiscordServerById')
exports.syncIndex = require('./src/functions/syncIndex')
exports.syncTags = require('./src/functions/syncTags')
exports.onDiscordMessageQueued = require('./src/functions/onDiscordMessageQueued')
exports.onPollResponseCreated = require('./src/functions/onPollResponseCreated')
exports.tallyPolls = require('./src/functions/tallyPolls')
exports.onAssetAmendmentCreated = require('./src/functions/onAssetAmendmentCreated')
exports.fetchGumroadInfo = require('./src/functions/fetchGumroadInfo')
exports.syncHomepage = require('./src/functions/syncHomepage')
exports.autoSyncHomepage = require('./src/functions/autoSyncHomepage')
exports.pickFeaturedAsset = require('./src/functions/pickFeaturedAsset')
exports.syncFeaturedAssets = require('./src/functions/syncFeaturedAssets')
exports.onFeaturedAssetsForUsersCreated = require('./src/functions/onFeaturedAssetsForUsersCreated')
exports.onFeaturedAssetsForUsersUpdated = require('./src/functions/onFeaturedAssetsForUsersUpdated')
exports.bulkEditTags = require('./src/functions/bulkEditTags')
exports.addMemberToConversationOnPrivateMessage = require('./src/functions/addMemberToConversationOnPrivateMessage')

const IS_BACKUP_ENABLED = config.global.isBackupEnabled !== 'false'

if (IS_BACKUP_ENABLED) {
  exports.manualBackup = require('./src/functions/manualBackup')
  exports.automatedBackup = require('./src/functions/automatedBackup')
}

exports.optimizeImage = require('./src/functions/optimizeImage')
exports.getPatreonUserInfo = require('./src/functions/getPatreonUserInfo')
exports.addEndorsementToAssetMeta = require('./src/functions/addEndorsementToAssetMeta')
exports.syncAssetMeta = require('./src/functions/syncAssetMeta')
exports.loginWithDiscord = require('./src/functions/loginWithDiscord')
exports.downloadAndOptimizeDiscordAvatar = require('./src/functions/downloadAndOptimizeDiscordAvatar')
// exports.syncAvatarList = require('./src/functions/syncAvatarList')
// exports.hydrateAvatarListOnAssetUpdate = require('./src/functions/hydrateAvatarListOnAssetUpdate')
exports.hydrateAssetMetaOnAssetCreate = require('./src/functions/hydrateAssetMetaOnAssetCreate')
exports.hydrateAssetMetaOnAssetUpdate = require('./src/functions/hydrateAssetMetaOnAssetUpdate')
// exports.hydrateAvatarListOnSpeciesCreate = require('./src/functions/hydrateAvatarListOnSpeciesCreate')
// exports.hydrateAvatarListOnSpeciesUpdate = require('./src/functions/hydrateAvatarListOnSpeciesUpdate')
exports.hydrateViewCacheOnAssetUpdate = require('./src/functions/hydrateViewCacheOnAssetUpdate')
// exports.syncViewCache = require('./src/functions/syncViewCache')
// exports.hydrateViewCacheOnSpeciesCreate = require('./src/functions/hydrateViewCacheOnSpeciesCreate')
// exports.hydrateViewCacheOnSpeciesUpdate = require('./src/functions/hydrateViewCacheOnSpeciesUpdate')
exports.repickFeaturedAsset = require('./src/functions/repickFeaturedAsset')
exports.getPaymentToken = require('./src/functions/getPaymentToken')
exports.createTransaction = require('./src/functions/createTransaction')
exports.getTransaction = require('./src/functions/getTransaction')
exports.braintreeWebhook = require('./src/functions/braintreeWebhook')
exports.hydateAssetMetaOnProductUpdate = require('./src/functions/hydateAssetMetaOnProductUpdate')
exports.hydateAssetMetaOnProductCreate = require('./src/functions/hydateAssetMetaOnProductCreate')
exports.hydrateAssetMetaOnContentUpdate = require('./src/functions/hydrateAssetMetaOnContentUpdate')
exports.getYouTubeVideoMeta = require('./src/functions/getYouTubeVideoMeta')
exports.getTweetMeta = require('./src/functions/getTweetMeta')
exports.awardOnAssetsApproved = require('./src/functions/awardOnAssetsApproved')
exports.syncAwards = require('./src/functions/syncAwards')

// avatars page pagination
exports.syncAvatarPages = require('./src/functions/syncAvatarPages')
exports.hydrateAvatarPagesOnAssetUpdate = require('./src/functions/hydrateAvatarPagesOnAssetUpdate')
exports.hydrateAvatarPagesOnSpeciesCreate = require('./src/functions/hydrateAvatarPagesOnSpeciesCreate')
exports.hydrateAvatarPagesOnSpeciesUpdate = require('./src/functions/hydrateAvatarPagesOnSpeciesUpdate')

// notifications
exports.notifyOnAssetAmended = require('./src/functions/notifyOnAssetAmended')
exports.notifyOnAssetApproved = require('./src/functions/notifyOnAssetApproved')
exports.notifyOnAssetUnapproved = require('./src/functions/notifyOnAssetUnapproved')
exports.notifyOnAssetDeleted = require('./src/functions/notifyOnAssetDeleted')
exports.notifyOnAssetNeedingApproval = require('./src/functions/notifyOnAssetNeedingApproval')
exports.notifyOnCommentCreated = require('./src/functions/notifyOnCommentCreated')
exports.notifyOnReportCreated = require('./src/functions/notifyOnReportCreated')
exports.notifyOnAwardGiven = require('./src/functions/notifyOnAwardGiven')
exports.notifyOnPrivateMessage = require('./src/functions/notifyOnPrivateMessage')
exports.notifyOnAssetOwnership = require('./src/functions/notifyOnAssetOwnership')

// view cache
cacheViews(exports)
exports.rebuildAllViewCaches = rebuildAllViewCaches
