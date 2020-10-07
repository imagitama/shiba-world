const functions = require('firebase-functions')
const { db, CollectionNames, DiscordServerFieldNames } = require('../firebase')
const {
  getInviteCodeFromUrl,
  getInviteFromDiscordApiByCode,
  getDiscordServerIcon,
} = require('../discord')

async function syncDiscordServerById(id) {
  const doc = db.collection(CollectionNames.DiscordServers).doc(id)
  const retrievedDoc = await doc.get()
  const inviteUrl = retrievedDoc.get(DiscordServerFieldNames.inviteUrl)

  if (!inviteUrl) {
    throw new Error('No invite URL for id')
  }

  const inviteCode = getInviteCodeFromUrl(inviteUrl)

  const invite = await getInviteFromDiscordApiByCode(inviteCode)

  await doc.set(
    {
      [DiscordServerFieldNames.name]: invite.guild.name,
      [DiscordServerFieldNames.description]: invite.guild.description,
      [DiscordServerFieldNames.iconUrl]: getDiscordServerIcon(
        invite.guild.id,
        invite.guild.icon
      ),
    },
    {
      merge: true,
    }
  )
}

module.exports = functions.https.onCall(async (data) => {
  try {
    const id = data.id

    if (!id) {
      throw new Error('Need to pass id')
    }

    await syncDiscordServerById(id)
    return { message: 'Discord server has been synced' }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('failed-to-sync', err.message)
  }
})
