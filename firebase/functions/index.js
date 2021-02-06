const config = require('./src/config')

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

// homepage
exports.syncHomepage = require('./src/functions/syncHomepage')
exports.autoSyncHomepage = require('./src/functions/autoSyncHomepage')

// featured assets
exports.pickFeaturedAsset = require('./src/functions/pickFeaturedAsset')
exports.syncFeaturedAssets = require('./src/functions/syncFeaturedAssets')
exports.onFeaturedAssetsForUsersCreated = require('./src/functions/onFeaturedAssetsForUsersCreated')
exports.onFeaturedAssetsForUsersUpdated = require('./src/functions/onFeaturedAssetsForUsersUpdated')

const IS_BACKUP_ENABLED = config.global.isBackupEnabled !== 'false'

if (IS_BACKUP_ENABLED) {
  exports.manualBackup = require('./src/functions/manualBackup')
  exports.automatedBackup = require('./src/functions/automatedBackup')
}

exports.optimizeImage = require('./src/functions/optimizeImage')
exports.getPatreonUserInfo = require('./src/functions/getPatreonUserInfo')

// asset meta
exports.addEndorsementToAssetMeta = require('./src/functions/addEndorsementToAssetMeta')
exports.syncAssetMeta = require('./src/functions/syncAssetMeta')
exports.loginWithDiscord = require('./src/functions/loginWithDiscord')
exports.downloadAndOptimizeDiscordAvatar = require('./src/functions/downloadAndOptimizeDiscordAvatar')
exports.syncAvatarList = require('./src/functions/syncAvatarList')
exports.addAvatarToList = require('./src/functions/addAvatarToList')
