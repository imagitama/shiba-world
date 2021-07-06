const functions = require('firebase-functions')
const { rebuildAllItemViewCaches } = require('../')

module.exports.rebuildAllItemViewCaches = functions
  .runWith({
    timeoutSeconds: 300,
    memory: '1GB',
  })
  .https.onRequest(async (req, res) => {
    try {
      const timeStart = performance.now()

      const result = await rebuildAllItemViewCaches()

      const timeEnd = performance.now()

      res.status(200).send({
        message: 'All item view caches have been rebuilt',
        count: result.viewNames.length,
        time: ((timeEnd - timeStart) / 1000).toFixed(2),
      })
    } catch (err) {
      console.error(err)
      res.status(500).send({ message: err.message })
      // throw new functions.https.HttpsError('unknown', err.message)
    }
  })
