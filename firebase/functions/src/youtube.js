const fetch = require('node-fetch')
const config = require('./config')
const { downloadImageUrl } = require('./apis')

const GOOGLEAPI_API_KEY = config.googleapi.api_key

const baseUrl = 'https://www.googleapis.com/youtube/v3'

async function queryApi(endpoint, params = {}) {
  const urlWithoutKey = `${baseUrl}/${endpoint}?${Object.entries(params).reduce(
    (newStr, [key, val]) => `${newStr}&${key}=${val}`,
    ''
  )}`

  console.debug(`query youtube api ${urlWithoutKey}`)

  const resp = await fetch(`${urlWithoutKey}&key=${GOOGLEAPI_API_KEY}`)

  if (!resp.ok) {
    throw new Error(`Response not OK! ${resp.status} ${resp.statusText}`)
  }

  return resp.json()
}

const getHighestResolutionThumbnailUrl = (thumbnailsMap) => {
  if (thumbnailsMap.maxres) {
    return thumbnailsMap.maxres.url
  }
  if (thumbnailsMap.high) {
    return thumbnailsMap.high.url
  }
  if (thumbnailsMap.medium) {
    return thumbnailsMap.medium.url
  }
  return thumbnailsMap.default.url
}

module.exports.getVideoById = async (id) => {
  const { items } = await queryApi('videos', {
    id,
    part: 'snippet',
  })
  const data = items[0].snippet

  const highestResThumbUrl = getHighestResolutionThumbnailUrl(data.thumbnails)

  // youtube has CORS errors so download a copy of the image
  const downloadedThumbnailUrl = await downloadImageUrl(
    highestResThumbUrl,
    'youtube-video-meta-thumbnails'
  )

  return {
    ...data,
    downloadedThumbnailUrl,
  }
}
