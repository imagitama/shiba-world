const functions = require('firebase-functions')
const { backupDatabaseToStorage, backupRunWithOptions } = require('../backups')

module.exports = functions
  .runWith(backupRunWithOptions)
  .https.onRequest(async (req, res) => {
    try {
      const { collectionNames } = await backupDatabaseToStorage()
      res
        .status(200)
        .send(`Backed up these collections: ${collectionNames.join(', ')}`)
    } catch (err) {
      console.error(err)
      res.status(500).send(`Error: ${err.message}`)
    }
  })
