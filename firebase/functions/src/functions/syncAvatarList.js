const functions = require('firebase-functions')
const { syncAvatarList } = require('../avatar-list')

module.exports = functions.https.onRequest(async (req, res) => {
  try {
    await syncAvatarList()
    res.status(200).send('Avatar list has been synced')
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
