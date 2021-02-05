const functions = require('firebase-functions')
const admin = require('firebase-admin')
const fetch = require('node-fetch')
const { URLSearchParams } = require('url')
const config = require('../config')

const DISCORD_CLIENT_ID = config.discord.client_id
const DISCORD_CLIENT_SECRET = config.discord.client_secret
const DISCORD_REDIRECT_URI = config.discord.redirect_uri

const discordApiUrl = 'https://discordapp.com/api/v6'

async function queryApi(endpoint, body, headers = {}) {
  const url = `${discordApiUrl}/${endpoint}`
  let params

  if (body) {
    params = new URLSearchParams()

    for (const key in body) {
      params.append(key, body[key])
    }
  }

  const resp = await fetch(url, {
    method: body ? 'POST' : 'GET',
    body: params,
    headers,
  })

  const message = await resp.json()

  if (!resp.ok) {
    throw new Error(
      `Response from discord api not OK! Status ${resp.status} ${
        resp.statusText
      } ${url} ${JSON.stringify(message)}`
    )
  }

  return message
}

async function getAccessToken(oauthCode) {
  console.debug(
    `Client ID ${DISCORD_CLIENT_ID} secret ${DISCORD_CLIENT_SECRET} redirect ${DISCORD_REDIRECT_URI}`
  )

  const resp = await queryApi(
    'oauth2/token',
    {
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: oauthCode,
      redirect_uri: DISCORD_REDIRECT_URI,
      scope: 'identity email',
    },
    {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  )
  return resp.access_token
}

async function getUserDetails(accessToken) {
  return queryApi('users/@me', null, {
    Authorization: `Bearer ${accessToken}`,
  })
}

module.exports = functions.https.onCall(async (data) => {
  try {
    if (!DISCORD_CLIENT_ID) {
      throw new Error('No client ID!')
    }
    if (!DISCORD_CLIENT_SECRET) {
      throw new Error('No client secret!')
    }
    if (!DISCORD_REDIRECT_URI) {
      throw new Error('No redirect URI!')
    }

    const code = data.code

    if (!code) {
      throw new Error('No oauth code!')
    }

    console.debug(`Given oauth code ${code}`)

    const accessToken = await getAccessToken(code)

    console.debug(`Got access token ${accessToken}`)

    const discordUser = await getUserDetails(accessToken)

    const userId = discordUser.id

    const token = await admin.auth().createCustomToken(userId)

    console.debug(`Got auth token: ${token}`)

    return { token, discordUser }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
