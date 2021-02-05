const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const path = require('path')
const os = require('os')
const { promises: fs } = require('fs')
const { optimizeBucketImageByUrl } = require('../images')

async function downloadAvatarToBucket(userId, avatarHash) {
  const bucket = admin.storage().bucket()

  // if user has no avatar
  if (!avatarHash) {
    return Promise.resolve()
  }

  const avatarUrl = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=320`

  const resp = await fetch(avatarUrl)

  console.debug(`Fetch avatar ${avatarUrl}`)

  if (!resp.ok) {
    throw new Error(
      `Response for avatar image not OK! Status ${resp.status} ${resp.statusText} ${avatarUrl}`
    )
  }

  const buffer = await resp.buffer()

  const fileName = `${userId}_${avatarHash}.png`
  const tempPath = path.join(os.tmpdir(), fileName)

  console.debug(`Download to temp ${tempPath}`)

  await fs.writeFile(tempPath, buffer)

  const pathToUploadedFile = `discord-avatars/${fileName}`

  await bucket.upload(tempPath, {
    destination: pathToUploadedFile,
  })

  const uploadedFile = bucket.file(pathToUploadedFile)
  const metadata = await uploadedFile.getMetadata()
  const downloadUrl = metadata[0].mediaLink

  return downloadUrl
}

module.exports = functions.https.onCall(async (data) => {
  try {
    const userId = data.userId

    if (!userId) {
      throw new Error('Need to provide user ID!')
    }

    const avatarHash = data.avatarHash

    if (!avatarHash) {
      throw new Error('Need to provide avatar hash!')
    }

    const avatarUrl = await downloadAvatarToBucket(userId, avatarHash)

    const optimizedImageUrl = await optimizeBucketImageByUrl(
      avatarUrl,
      300,
      300
    )

    return { message: 'Discord avatar has been optimized', optimizedImageUrl }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
