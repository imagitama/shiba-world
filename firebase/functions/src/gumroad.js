const fetch = require('node-fetch')
const TurndownService = require('turndown')
const util = require('util')
const fs = require('fs')
const path = require('path')
const os = require('os')
const admin = require('firebase-admin')

const streamPipeline = util.promisify(require('stream').pipeline)

let turndownService

const getTurndownService = () => {
  if (!turndownService) {
    turndownService = new TurndownService()
  }
  return turndownService
}

const getMarkdownFromHtml = (html) => {
  return getTurndownService().turndown(html)
}

const getCodeFromUrl = (url) => {
  return url.split('/').pop()
}

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

const getOurPreviewUrl = async (sourceUrl) => {
  const pathOnFilesystem = await downloadImageToFs(sourceUrl)

  const bucket = admin.storage().bucket()

  const newFilePath = `sync-with-gumroad-images/${path.basename(sourceUrl)}`

  console.debug(`Uploading file to bucket: ${newFilePath}`)

  await bucket.upload(pathOnFilesystem, {
    destination: newFilePath,
  })

  const destFile = bucket.file(newFilePath)

  const metadata = await destFile.getMetadata()
  const downloadUrl = metadata[0].mediaLink

  console.debug(`File has been uploaded with URL: ${downloadUrl}`)

  return downloadUrl
}

const getProductInfoByCode = async (code) => {
  const resp = await fetch(`https://gumroad.com/l/${code}.json`, {
    redirect: 'manual',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // custom permalink
  if (resp.status === 302) {
    return getProductInfoByCode(getCodeFromUrl(resp.headers.get('location')))
  }

  if (!resp.ok) {
    throw new Error(
      `Response not OK! Status: ${resp.status} Text: ${resp.statusText}`
    )
  }

  const result = await resp.json()

  return {
    ...result,
    ourPreviewUrl: await getOurPreviewUrl(result.preview_url),
    descriptionMarkdown: getMarkdownFromHtml(result.description),
  }
}
module.exports.getProductInfoByCode = getProductInfoByCode
