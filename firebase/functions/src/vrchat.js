const fetch = require('node-fetch')
const config = require('./config')

const apiEndpoint = 'https://api.vrchat.cloud/api/1/'
let cookie
let providedClientApiKey // given to us by the API

const IS_VRCHAT_ENABLED = config.global.isVrchatEnabled !== 'false'
const VRCHAT_USERNAME = config.vrchat.username
const VRCHAT_PASSWORD = config.vrchat.password

function getAuthorizationHeaderContents() {
  return Buffer.from(`${VRCHAT_USERNAME}:${VRCHAT_PASSWORD}`).toString('base64')
}

async function getClientApiKey() {
  const resp = await fetch(`${apiEndpoint}config`, {
    method: 'GET',
  })

  if (!resp.ok) {
    throw new Error(
      `Response not OK! Status ${resp.status} text ${resp.statusText}`
    )
  }

  const { clientApiKey } = await resp.json()

  providedClientApiKey = clientApiKey

  console.debug(`Got api key: ${providedClientApiKey}`)
}

async function queryApi(path) {
  if (!IS_VRCHAT_ENABLED) {
    return Promise.resolve()
  }

  if (!providedClientApiKey) {
    await getClientApiKey()
  }

  console.log(
    `Query VRChat API ${path} username ${VRCHAT_USERNAME} apiKey ${providedClientApiKey}`
  )

  const resp = await fetch(
    `${apiEndpoint}${path}?apiKey=${providedClientApiKey}`,
    {
      method: 'GET',
      headers: cookie
        ? {
            cookie,
          }
        : {
            Authorization: `Basic ${getAuthorizationHeaderContents()}`,
          },
    }
  )

  const json = await resp.json()

  if (!resp.ok) {
    throw new Error(
      `Response not OK! Status ${resp.status} text ${
        resp.statusText
      } json ${JSON.stringify(json)}`
    )
  }

  if (!cookie) {
    cookie = resp.headers['set-cookie']
    console.log(`Got cookie ${cookie}`)
  }

  return json
}

module.exports.getUserStatusByUsername = (username) => {
  console.debug(`Looking up ${username}`)

  return queryApi(`users/${username}/name`)
}
