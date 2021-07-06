const functions = require('firebase-functions')
const { performance } = require('perf_hooks')
const { rebuildAllViewCaches } = require('../utils/rebuild')

module.exports = (viewCacheDefinitions) =>
  functions
    .runWith({
      timeoutSeconds: 300,
      memory: '1GB',
    })
    .https.onRequest(async (req, res) => {
      try {
        const timeStart = performance.now()

        const result = await rebuildAllViewCaches(viewCacheDefinitions)

        const timeEnd = performance.now()

        res.setHeader('Content-Type', 'application/json')
        res.status(200)
        res.send(
          JSON.stringify(
            {
              message: 'All view caches have been rebuilt',
              count: result.viewNames.length,
              views: result.views,
              time: ((timeEnd - timeStart) / 1000).toFixed(2),
            },
            null,
            2
          )
        )
      } catch (err) {
        console.error(err)
        res.status(500).send({ message: err.message })
        // throw new functions.https.HttpsError('unknown', err.message)
      }
    })
