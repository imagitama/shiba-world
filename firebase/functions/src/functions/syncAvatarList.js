const functions = require('firebase-functions')
const { syncAvatarList } = require('../avatar-list')

module.exports = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onRequest(async (req, res) => {
    try {
      const { count } = await syncAvatarList()
      res.status(200).send({ message: 'Avatar list has been synced', count })
    } catch (err) {
      console.error(err)
      throw new functions.https.HttpsError('unknown', err.message)
    }
  })
