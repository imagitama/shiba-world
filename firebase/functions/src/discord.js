const fetch = require('node-fetch')
const config = require('./config')
const { VRCARENA_BASE_URL, routes } = require('./site')
const {
  db,
  CollectionNames,
  DiscordMessageFieldNames,
  DiscordMessageStatuses,
} = require('./firebase')

const IS_DISCORD_ENABLED = config.global.isDiscordEnabled !== 'false'
const DISCORD_ACTIVITY_WEBHOOK_URL = config.discord.activity_webhook_url
const DISCORD_EDITOR_NOTIFICATIONS_WEBHOOK_URL =
  config.discord.editor_notifications_webhook_url

const channelNames = {
  activity: 'activity',
  editorNotifications: 'editor-notifications',
}
module.exports.channelNames = channelNames

const emitToDiscord = async (webhookUrl, message, embeds = []) => {
  console.debug('Emitting to discord', webhookUrl, message)

  if (!IS_DISCORD_ENABLED) {
    return Promise.resolve()
  }

  const resp = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content: message,
      embeds,
    }),
  })

  if (!resp.ok) {
    throw new Error(`Response not OK! ${resp.status} ${resp.statusText}`)
  }

  return true
}

module.exports.emitToDiscordActivity = (message, embeds) => {
  return emitToDiscord(DISCORD_ACTIVITY_WEBHOOK_URL, message, embeds)
}

module.exports.emitToDiscordEditorNotifications = (message, embeds) => {
  return emitToDiscord(
    DISCORD_EDITOR_NOTIFICATIONS_WEBHOOK_URL,
    message,
    embeds
  )
}

module.exports.getUrlForViewAsset = (assetId) => {
  return `${VRCARENA_BASE_URL}${routes.viewAssetWithVar.replace(
    ':assetId',
    assetId
  )}`
}

module.exports.getEmbedForViewAsset = (assetId) => {
  return {
    title: 'View Asset',
    url: module.exports.getUrlForViewAsset(assetId),
  }
}

module.exports.getEmbedForViewProfile = (userId) => {
  return {
    title: 'View Profile',
    url: `${VRCARENA_BASE_URL}${routes.viewUserWithVar.replace(
      ':userId',
      userId
    )}`,
  }
}

module.exports.getEmbedForViewRequest = (requestId) => {
  return {
    title: 'View Request',
    url: `${VRCARENA_BASE_URL}${routes.viewRequestWithVar.replace(
      ':requestId',
      requestId
    )}`,
  }
}

const DISCORD_BOT_TOKEN = config.discord.bot_token

const discordApiUrl = 'https://discordapp.com/api/v6'

async function queryDiscordApi(endpoint) {
  const url = `${discordApiUrl}/${endpoint}`
  return fetch(url, {
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    },
  }).then((resp) => {
    if (!resp.ok) {
      throw new Error(
        `Response from discord api not OK! Status ${resp.status} ${resp.statusText} ${url}`
      )
    }
    return resp.json()
  })
}

module.exports.getInviteCodeFromUrl = (inviteUrl) => {
  return inviteUrl.split('/').pop()
}

module.exports.getInviteFromDiscordApiByCode = (inviteCode) => {
  return queryDiscordApi(`invites/${inviteCode}`)
}

module.exports.getDiscordServerIcon = (guildId, iconHash) => {
  if (!guildId) {
    throw new Error(`No guild id!`)
  }

  if (!iconHash) {
    return ''
  }

  // https://discord.com/developers/docs/reference#image-formatting
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.png`
}

module.exports.queueMessage = async (channelName, message, embeds = []) => {
  return db.collection(CollectionNames.DiscordMessages).add({
    [DiscordMessageFieldNames.channelName]: channelName,
    [DiscordMessageFieldNames.message]: message,
    [DiscordMessageFieldNames.embeds]: embeds,
    [DiscordMessageFieldNames.status]: DiscordMessageStatuses.Queued,
    [DiscordMessageFieldNames.lastModifiedAt]: null,
    [DiscordMessageFieldNames.createdAt]: new Date(),
  })
}
