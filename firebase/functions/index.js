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

const IS_BACKUP_ENABLED = config.global.isBackupEnabled !== 'false'

if (IS_BACKUP_ENABLED) {
  exports.manualBackup = require('./src/functions/manualBackup')
  exports.automatedBackup = require('./src/functions/automatedBackup')
}

exports.optimizeImage = require('./src/functions/optimizeImage')
