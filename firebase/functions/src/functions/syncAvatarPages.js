const functions = require('firebase-functions')
const { syncAvatarPages } = require('../avatar-pages')

module.exports = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onRequest(async (req, res) => {
    try {
      const result = await syncAvatarPages()
      res.status(200).send({ message: 'Avatar pages have been synced', ...result })
    } catch (err) {
      console.error(err)
      throw new functions.https.HttpsError('unknown', err.message)
    }
  })
