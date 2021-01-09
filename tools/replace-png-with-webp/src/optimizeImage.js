const admin = require('firebase-admin')
const path = require('path')
const os = require('os')
const fs = require('fs')
const child_process = require('child_process')

const isDebugMode = true

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (str, newStr) {
    // If a regex pattern
    if (
      Object.prototype.toString.call(str).toLowerCase() === '[object regexp]'
    ) {
      return this.replace(str, newStr)
    }

    // If a string
    return this.replace(new RegExp(str, 'g'), newStr)
  }
}

module.exports.optimizeImage = async (imageUrl) => {
  const gcs = admin.storage()
  const bucket = gcs.bucket('shiba-world.appspot.com')

  if (isDebugMode) console.debug(`Optimizing ${imageUrl}`)

  if (!imageUrl.includes('/o/')) {
    console.log(
      'URL is not a Firebase one so needs to be manually done: ',
      imageUrl
    )
    return imageUrl
  }

  // storage urls are long and encoded and include a token
  // so convert it into something the storage SDK will understand
  const filePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0])
  // .replaceAll('%2F', '/')
  // .replaceAll('%20', ' ')
  // .replaceAll('%2C', ',')
  const sourceFileName = path.basename(filePath)
  const fileExtension = path
    .extname(sourceFileName)
    .toLowerCase()
    .replace('.', '')

  if (isDebugMode) console.debug(`Looking up file ${filePath}`)

  const sourceFile = bucket.file(filePath)

  const newFileName = sourceFileName.replace(fileExtension, 'webp')

  const newFilePath = filePath.replace('.png', '.webp')

  const existingFile = bucket.file(newFilePath)

  if (isDebugMode) console.debug(`Checking if it exists: ${newFilePath}`)

  const [doesExist] = await existingFile.exists()

  if (doesExist) {
    if (isDebugMode) console.debug(`It does!`)

    const metadata = await existingFile.getMetadata()
    const existingDownloadUrl = metadata[0].mediaLink
    return existingDownloadUrl
  } else {
    if (isDebugMode) console.debug(`It does not exist`)
  }

  const tempDownloadFilePath = path.join(os.tmpdir(), sourceFileName)

  await sourceFile.download({ destination: tempDownloadFilePath })

  if (isDebugMode) console.debug(`Downloaded to ${tempDownloadFilePath}`)

  const tempUploadFilePath = path.join(os.tmpdir(), newFileName)

  // ffmpeg.exe on Windows (or Ubuntu for Windows) and ffmpeg on Linux/macOS
  const ffmpegOutput = await new Promise((resolve, reject) =>
    child_process.exec(
      `ffmpeg.exe -i "${tempDownloadFilePath}" -y -quality 80 "${tempUploadFilePath}"`,
      (err, stdout, stderr) => {
        if (err) {
          reject(err)
          return
        }

        if (isDebugMode) console.debug(stdout)

        if (stderr) {
          console.error(stderr)
        }

        resolve(stdout)
      }
    )
  )

  if (isDebugMode) console.debug(`Outputted to ${tempUploadFilePath}`)

  if (isDebugMode) console.debug(ffmpegOutput)

  await bucket.upload(tempUploadFilePath, {
    destination: newFilePath,
    metadata: {
      contentType: `image/webp`,
    },
  })

  const destFile = bucket.file(newFilePath)

  // clean up
  await fs.unlinkSync(tempDownloadFilePath)
  await fs.unlinkSync(tempUploadFilePath)

  // cannot use signed urls as they expire in 1 week
  const metadata = await destFile.getMetadata()
  const downloadUrl = metadata[0].mediaLink

  if (isDebugMode) console.debug(`Download URL: ${downloadUrl}`)

  return downloadUrl
}
