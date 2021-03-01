const util = require('util')
const fs = require('fs')
const path = require('path')
const os = require('os')
const admin = require('firebase-admin')
const fetch = require('node-fetch')

const streamPipeline = util.promisify(require('stream').pipeline)

// source: https://github.com/node-fetch/node-fetch/issues/375#issuecomment-599715645
async function downloadImageToFs(url) {
  console.debug(`Downloading image to filesystem: ${url}`)

  const response = await fetch(url)
  if (!response.ok)
    throw new Error(`unexpected response ${response.statusText}`)
  const tempDownloadPath = path.join(os.tmpdir(), path.basename(url))

  console.debug(`Streaming to: ${tempDownloadPath}`)

  await streamPipeline(response.body, fs.createWriteStream(tempDownloadPath))

  console.debug('Image has been downloaded')

  return tempDownloadPath
}

module.exports.downloadImageUrl = async (sourceUrl, directoryPath = '') => {
  const pathOnFilesystem = await downloadImageToFs(sourceUrl)

  const bucket = admin.storage().bucket()

  const newFilePath = `${directoryPath}/${path.basename(sourceUrl)}`

  console.debug(`Uploading file to bucket: ${newFilePath}`)

  await bucket.upload(pathOnFilesystem, {
    destination: newFilePath,
    resumable: false, // fix weird ResumableUploadError error
  })

  const destFile = bucket.file(newFilePath)

  const metadata = await destFile.getMetadata()
  const downloadUrl = metadata[0].mediaLink

  console.debug(`File has been uploaded with URL: ${downloadUrl}`)

  return downloadUrl
}
