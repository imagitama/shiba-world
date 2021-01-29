const functions = require('firebase-functions')
const { backupDatabaseToStorage } = require('../backups')

module.exports = functions.pubsub
  .schedule('0 0 * * *') // daily at midnight
  .onRun(async () => backupDatabaseToStorage())
