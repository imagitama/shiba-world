const functions = require('firebase-functions')
const admin = require('firebase-admin')
const path = require('path')
const os = require('os')
const fs = require('fs')
const child_process = require('child_process')

async function optimizeBucketImageByUrl(imageUrl) {
  const gcs = admin.storage()
  const bucket = gcs.bucket()

  console.debug(`Optimizing ${imageUrl}`)

  // storage urls are long and encoded and include a token
  // so convert it into something the storage SDK will understand
  const filePath = imageUrl
    .split('/o/')[1]
    .split('?')[0]
    .replace('%2F', '/')
    .replace('%2F', '/')
    .replace('%20', ' ')
  const fileName = path.basename(filePath)
  const fileExtension = path.extname(filePath).toLowerCase().replace('.', '')

  const newFileName = path.basename(filePath).replace(fileExtension, 'webp')
  const newFilePath = path.join(path.dirname(filePath), newFileName)

  const sourceFile = bucket.file(filePath)

  const tempDownloadFilePath = path.join(os.tmpdir(), fileName)

  await sourceFile.download({ destination: tempDownloadFilePath })

  console.debug(`Downloaded to ${tempDownloadFilePath}`)

  const tempUploadFilePath = path.join(os.tmpdir(), newFileName)

  const ffmpegOutput = await new Promise((resolve, reject) =>
    child_process.exec(
      `ffmpeg${
        process.env.IS_EMULATOR ? '.exe' : ''
      } -i "${tempDownloadFilePath}" -y "${tempUploadFilePath}"`,
      (err, stdout, stderr) => {
        if (err) {
          reject(err)
          return
        }

        console.debug(stdout)

        if (stderr) {
          console.error(stderr)
        }

        resolve(stdout)
      }
    )
  )

  console.debug(`Outputted to ${tempUploadFilePath}`)

  console.debug(ffmpegOutput)

  await bucket.upload(tempUploadFilePath, {
    destination: newFilePath,
    metadata: {
      contentType: `image/webp`,
      cacheControl: 'public,max-age=31536000', // default cache is 3600
    },
  })

  const destFile = bucket.file(newFilePath)

  // clean up
  await fs.unlinkSync(tempDownloadFilePath)
  await fs.unlinkSync(tempUploadFilePath)

  // cannot use signed urls as they expire in 1 week
  const metadata = await destFile.getMetadata()
  const downloadUrl = metadata[0].mediaLink

  console.debug(`Download URL: ${downloadUrl}`)

  return downloadUrl
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
