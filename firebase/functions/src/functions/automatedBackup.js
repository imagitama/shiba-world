const functions = require('firebase-functions')
const { backupDatabaseToStorage, backupRunWithOptions } = require('../backups')

module.exports = functions
  .runWith(backupRunWithOptions)
  .pubsub.schedule('0 0 * * *') // daily at midnight
  .onRun(async () => backupDatabaseToStorage())
