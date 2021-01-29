const functions = require('firebase-functions')
const { backupDatabaseToStorage } = require('../backups')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await backupDatabaseToStorage()
    res.status(200).send(`Backup success`)
  } catch (err) {
    console.error(err)
    res.status(500).send(`Error: ${err.message}`)
  }
})
