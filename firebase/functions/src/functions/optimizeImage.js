const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sharp = require('sharp')
const path = require('path')

async function optimizeBucketImageByUrl(imageUrl) {
  const gcs = admin.storage()
  const bucket = gcs.bucket()

  // storage urls are long and encoded and include a token
  // so convert it into something the storage SDK will understand
  const filePath = imageUrl.split('/o/')[1].split('?')[0].replace('%2F', '/')
  const fileExtension = path.extname(filePath).toLowerCase().replace('.', '')

  const newFileName = path.basename(filePath).replace(fileExtension, 'webp')
  const newFilePath = path.join(path.dirname(filePath), newFileName)

  const pipeline = sharp()

  // read source file and give it to sharp
  const sourceFile = bucket.file(filePath)
  sourceFile.createReadStream().pipe(pipeline)

  const destFile = bucket.file(newFilePath)

  const writeStream = destFile.createWriteStream({
    metadata: {
      contentType: `image/webp`,
    },
  })

  // convert and perform write
  pipeline
    .toFormat('webp')
    .webp({ lossless: false, quality: 60, alphaQuality: 80, force: false })
    .pipe(writeStream)

  return new Promise((resolve, reject) =>
    writeStream
      .on('finish', async () => {
        const [url] = await destFile.getSignedUrl({
          action: 'read',
          expires: '01-01-2050',
        })

        await destFile.setMetadata({
          cacheControl: 'public, max-age=15552000',
        })

        resolve(url)
      })
      .on('error', reject)
  )
}

module.exports = functions.https.onCall(async (data) => {
  try {
    const imageUrl = data.imageUrl

    if (!imageUrl) {
      throw new Error('Need to provide imageUrl')
    }

    const optimizedImageUrl = await optimizeBucketImageByUrl(imageUrl)

    return { message: 'Image has been optimized', optimizedImageUrl }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('failed-to-optimize', err.message)
  }
})
