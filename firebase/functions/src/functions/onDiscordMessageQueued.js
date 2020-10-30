const functions = require('firebase-functions')
const {
  DiscordMessageFieldNames,
  DiscordMessageStatuses,
} = require('../firebase')
const {
  emitToDiscordActivity,
  emitToDiscordEditorNotifications,
  channelNames,
} = require('../discord')

async function updateQueuedMessageStatus(doc, newStatus) {
  return doc.ref.set(
    {
      [DiscordMessageFieldNames.status]: newStatus,
      [DiscordMessageFieldNames.lastModifiedAt]: new Date(),
    },
    {
      merge: true,
    }
  )
}

module.exports = functions.firestore
  .document('discordMessages/{discordMessageId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    switch (docData[DiscordMessageFieldNames.channelName]) {
      case channelNames.activity:
        await emitToDiscordActivity(
          docData[DiscordMessageFieldNames.message],
          docData[DiscordMessageFieldNames.embeds]
            ? docData[DiscordMessageFieldNames.embeds]
            : []
        )
        await updateQueuedMessageStatus(doc, DiscordMessageStatuses.Sent)
        break

      case channelNames.editorNotifications:
        await emitToDiscordEditorNotifications(
          docData[DiscordMessageFieldNames.message],
          docData[DiscordMessageFieldNames.embeds]
            ? docData[DiscordMessageFieldNames.embeds]
            : []
        )
        await updateQueuedMessageStatus(doc, DiscordMessageStatuses.Sent)
        break

      default:
        await updateQueuedMessageStatus(doc, DiscordMessageStatuses.Error)

        throw new Error(
          `Unknown channel name "${
            docData[DiscordMessageFieldNames.channelName]
          }" queued for discord message ${doc.id}`
        )
    }
  })
