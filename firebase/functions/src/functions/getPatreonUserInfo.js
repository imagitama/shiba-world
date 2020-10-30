const functions = require('firebase-functions')
const fetch = require('node-fetch')
const config = require('../config')
const { db, CollectionNames, UserFieldNames } = require('../firebase')
const {
  queueMessage: queueDiscordMessage,
  channelNames,
} = require('../discord')

const CLIENT_ID = config.patreon.client_id
const CLIENT_SECRET = config.patreon.client_secret
const REDIRECT_URI = config.patreon.redirect_uri

const patreonApiBaseUrl = 'https://www.patreon.com/api/oauth2/v2'

async function getAccessTokenWithCode(code) {
  const url = `https://www.patreon.com/api/oauth2/token?\
code=${code}&\
grant_type=authorization_code&\
client_id=${CLIENT_ID}&\
client_secret=${CLIENT_SECRET}&\
redirect_uri=${REDIRECT_URI}`

  console.log('getAccessTokenWithCode', url)

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!resp.ok) {
    const body = await resp.text()

    throw new Error(
      `Failed to get access token with code "${code}": ${resp.status} ${resp.statusText} ${body}`
    )
  }

  const { access_token } = await resp.json()

  return access_token
}

async function fetchFromPatreonWithAccessToken(path, accessToken) {
  const resp = await fetch(`${patreonApiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch ${path} with access token "${accessToken}": ${resp.status} ${resp.statusText}`
    )
  }

  return resp.json()
}

const vrcarenaCampaignId = '5479725'
// const oneDollarTierId = '6084795'

async function getIsAOneDollarTierPatronWithCode(code) {
  const accessToken = await getAccessTokenWithCode(code)
  const {
    data: {
      id: patreonUserId,
      relationships: {
        memberships: { data: memberships },
      },
    },
  } = await fetchFromPatreonWithAccessToken(
    `/identity?include=memberships`,
    accessToken
  )

  if (!memberships) {
    console.log('Not a member of any campaigns')
    return { isPatron: false, patreonUserId }
  }

  // if they are a patron of a lot of campaigns this does a fetch per one!
  const results = await Promise.all(
    memberships.map(async (membership) => {
      const {
        data: {
          relationships: {
            campaign: {
              data: { id: campaignId },
            },
          },
        },
      } = await fetchFromPatreonWithAccessToken(
        `/members/${membership.id}?include=campaign`,
        accessToken
      )

      console.log('Checking campaign ID', campaignId)

      return campaignId === vrcarenaCampaignId
    })
  )

  const isPatron = results.some((result) => result === true)

  return { isPatron, patreonUserId }
}

async function storeIsOneDollarTierPatronForUser(
  userId,
  isPatron,
  patreonUserId
) {
  if (!userId) {
    throw new Error(
      'Cannot store is one dollar tier patreon without a user ID!'
    )
  }

  return db
    .collection(CollectionNames.Users)
    .doc(userId)
    .set(
      {
        [UserFieldNames.isPatron]: isPatron,
        [UserFieldNames.patreonUserId]: patreonUserId,
        [UserFieldNames.lastModifiedAt]: new Date(),
        [UserFieldNames.lastModifiedBy]: db.doc(
          `${CollectionNames.Users}/${userId}`
        ),
      },
      {
        merge: true,
      }
    )
}

module.exports = functions.https.onCall(async (data, context) => {
  try {
    const code = data.code

    if (!code) {
      throw new Error('Need to pass Patreon code')
    }

    const { isPatron, patreonUserId } = await getIsAOneDollarTierPatronWithCode(
      code
    )

    await storeIsOneDollarTierPatronForUser(
      context.auth.uid,
      isPatron,
      patreonUserId
    )

    await queueDiscordMessage(
      channelNames.activity,
      `User ${context.auth.uid} just connected their VRCArena account with Patreon`
    )

    return { isPatron }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-get-patreon-user-info',
      err.message
    )
  }
})
