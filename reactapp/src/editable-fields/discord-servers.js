import { DiscordServerFieldNames } from '../hooks/useDatabaseQuery'

export default [
  {
    name: DiscordServerFieldNames.name,
    label: 'Name',
    type: 'text',
    isRequired: true,
    hint:
      'The name of the server. This will be automatically populated at some point'
  },
  {
    name: DiscordServerFieldNames.widgetId,
    label: 'Widget ID',
    default: '',
    type: 'text',
    hint:
      'Enable widgets and paste the server ID here so that we can display a widget for it.'
  },
  {
    name: DiscordServerFieldNames.iconUrl,
    label: 'Icon URL',
    type: 'text',
    default: '',
    hint:
      'The URL to the icon of the server. This will be automatically populated at some point'
  },
  {
    name: DiscordServerFieldNames.inviteUrl,
    label: 'Invite URL',
    default: '',
    type: 'text',
    hint: 'The invite URL of the server. Remember to not make it expire!'
  },
  {
    name: DiscordServerFieldNames.requiresPatreon,
    label: 'Requires Patreon?',
    default: '',
    type: 'checkbox',
    hint: 'Do you need to be a Patreon sub to join this server?'
  },
  {
    name: DiscordServerFieldNames.patreonUrl,
    label: 'Patreon URL',
    default: '',
    type: 'text',
    hint: 'The URL to the Patreon you need to be a sub for to join it'
  }
]
