const fetch = require('node-fetch')
const config = require('./config')
const { CollectionNames, db, UserMetaFieldNames } = require('./firebase')

const CLIENT_ID = config.patreon.client_id
const CLIENT_SECRET = config.patreon.client_secret
const REDIRECT_URI = config.patreon.redirect_uri

const patreonApiV1BaseUrl = 'https://www.patreon.com/api/oauth2/api'
const patreonApiV2BaseUrl = 'https://www.patreon.com/api/oauth2/v2'

const vrcarenaCampaignId = '5479725'

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

    // 401 should mean user has not given us a valid code
    if (resp.status === 401) {
      return null
    }

    throw new Error(
      `Failed to get access token with code "${code}": ${resp.status} ${resp.statusText} ${body}`
    )
  }

  const { access_token } = await resp.json()

  console.log('got access token', access_token)

  return access_token
}

async function fetchFromPatreonWithAccessToken(version, path, accessToken) {
  const url = `${
    version === 1 ? patreonApiV1BaseUrl : patreonApiV2BaseUrl
  }${path}`

  console.debug('fetch from patreon API', url, accessToken)

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!resp.ok) {
    throw new Error(
      `Failed to fetch ${url} with access token "${accessToken}": ${resp.status} ${resp.statusText}`
    )
  }

  return resp.json()
}

// async function fetchFromPatreonV1WithAccessToken(path, accessToken) {
//   return fetchFromPatreonWithAccessToken(1, path, accessToken)
// }

async function fetchFromPatreonV2WithAccessToken(path, accessToken) {
  return fetchFromPatreonWithAccessToken(2, path, accessToken)
}

const storeRewardIds = async (userId, patreonUserId, rewardIds) => {
  console.log('store reward ids', userId, patreonUserId, rewardIds)
  return db
    .collection(CollectionNames.UserMeta)
    .doc(userId)
    .set(
      {
        [UserMetaFieldNames.isPatron]: rewardIds.length !== 0,
        [UserMetaFieldNames.patreonUserId]: patreonUserId,
        [UserMetaFieldNames.patreonRewardIds]: rewardIds,
        [UserMetaFieldNames.lastModifiedAt]: new Date(),
        [UserMetaFieldNames.lastModifiedBy]: db.doc(
          `${CollectionNames.Users}/${userId}`
        ),
      },
      {
        merge: true,
      }
    )
}

const getPatreonUserIdAndRewardIds = async (accessToken) => {
  // v1 is the only one working right now to grab pledge info
  // https://docs.patreon.com/#fetching-a-patron-39-s-profile-info
  // const currentUserInfo = await fetchFromPatreonV1WithAccessToken(
  //   '/current_user',
  //   accessToken
  // )

  // try {
  //   return currentUserInfo.included
  //     .filter((item) => item.type === 'reward')
  //     .map((reward) => reward.id)
  // } catch (err) {
  //   console.debug('Failed to dig up pledge IDs - returning empty', err)
  //   return []
  // }

  const {
    data: {
      id: patreonUserId,
      relationships: {
        memberships: { data: memberships },
      },
    },
  } = await fetchFromPatreonV2WithAccessToken(
    `/identity?include=memberships`,
    accessToken
  )

  if (!memberships) {
    console.log('Not a member of any campaigns')
    return []
  }

  // if they are a patron of a lot of campaigns this does a fetch per one!
  const arrayOfArrayOfTierIds = await Promise.all(
    memberships.map(async (membership) => {
      const response = await fetchFromPatreonV2WithAccessToken(
        `/members/${membership.id}?include=campaign,campaign.benefits`,
        accessToken
      )

      const campaignId = response.data.relationships.campaign.data.id

      console.log('Checking campaign ID', campaignId)

      if (campaignId === vrcarenaCampaignId) {
        const benefitIds = response.included
          .filter((item) => item.type === 'benefit')
          .map((item) => item.id)
        return benefitIds
      }
    })
  )

  const benefitIds = arrayOfArrayOfTierIds.reduce(
    (finalIds, ids) => finalIds.concat(ids),
    []
  )

  return {
    patreonUserId,
    rewardIds: benefitIds,
  }
}

module.exports.fetchRewardsAndStore = async (userId, oauthCode) => {
  // TODO: Do this and cache it in memory for future calls? Will need to check expiry!
  const accessToken = await getAccessTokenWithCode(oauthCode)

  if (!accessToken) {
    return null
  }

  const { patreonUserId, rewardIds } = await getPatreonUserIdAndRewardIds(
    accessToken
  )

  await storeRewardIds(userId, patreonUserId, rewardIds)

  return rewardIds
}
