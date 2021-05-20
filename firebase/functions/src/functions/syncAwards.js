const functions = require('firebase-functions')
const { syncAwards } = require('../awards')

module.exports = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onRequest(async (req, res) => {
    try {
      const { count } = await syncAwards()
      res.status(200).send({ message: 'Awards have been synced', count })
    } catch (err) {
      console.error(err)
      throw new functions.https.HttpsError('unknown', err.message)
    }
  })
