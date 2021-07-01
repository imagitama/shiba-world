const functions = require('firebase-functions')
const { fetchRewardsAndStore } = require('../patreon')
const {
  queueMessage: queueDiscordMessage,
  channelNames,
} = require('../discord')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    const code = data.code
    const userId = context.auth.uid

    if (!code) {
      throw new Error('Need to pass Patreon code')
    }

    if (!userId) {
      throw new Error('Need to have a user ID')
    }

    const rewardIds = await fetchRewardsAndStore(userId, code)

    if (!rewardIds) {
      return { rewardIds: null }
    }

    await await queueDiscordMessage(
      channelNames.activity,
      `User ${userId} just connected their VRCArena account with Patreon`
    )

    return { rewardIds }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-get-patreon-user-info',
      err.message
    )
  }
})
