const functions = require('firebase-functions')
const { syncHomepage } = require('../homepage')

module.exports = functions.pubsub
  .schedule('0 0 * * *') // daily at midnight
  .onRun(async () => syncHomepage())
