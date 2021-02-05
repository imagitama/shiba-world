const functions = require('firebase-functions')
const { optimizeBucketImageByUrl } = require('../images')

module.exports = functions.https.onCall(async (data) => {
  try {
    const imageUrl = data.imageUrl

    if (!imageUrl) {
      throw new Error('Need to provide imageUrl')
    }

    const optimizedImageUrl = await optimizeBucketImageByUrl(
      imageUrl,
      data.width,
      data.height
    )

    return { message: 'Image has been optimized', optimizedImageUrl }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
