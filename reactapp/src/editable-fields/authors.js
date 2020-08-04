import { AssetCategories, AuthorFieldNames } from '../hooks/useDatabaseQuery'

export default [
  {
    name: AuthorFieldNames.name,
    label: 'Name',
    type: 'text',
    isRequired: true
  },
  {
    name: AuthorFieldNames.description,
    label: 'Description',
    type: 'textMarkdown',
    default: ''
  },
  {
    name: AuthorFieldNames.websiteUrl,
    label: 'Website URL',
    type: 'text',
    default: ''
  },
  {
    name: AuthorFieldNames.email,
    label: 'Email',
    type: 'text',
    default: '',
    hint: 'Warning: Bots can find this URL so your spam inbox will be flooded!'
  },
  {
    name: AuthorFieldNames.twitterUsername,
    label: 'Twitter Username (without @)',
    type: 'text',
    default: ''
  },
  {
    name: AuthorFieldNames.gumroadUsername,
    label: 'Gumroad Username',
    type: 'text',
    default: '',
    hint:
      'eg. Tosca is "xtosca" which is from their profile URL https://gumroad.com/xtosca'
  },
  {
    name: AuthorFieldNames.discordUsername,
    label: 'Discord Username',
    type: 'text',
    default: '',
    hint:
      'Your personal Discord username. Usually contains a hash and 4 digits ie PeanutBuddha#1234'
  },
  {
    name: AuthorFieldNames.discordServerInviteUrl,
    label: 'Discord Server Invite URL',
    type: 'text',
    default: '',
    hint:
      'A URL people can visit to join your Discord server. eg. https://discord.gg/gpD7fq Is hidden if server ID is provided'
  },
  {
    name: AuthorFieldNames.discordServerId,
    label: 'Discord Server ID',
    type: 'text',
    default: '',
    hint:
      'Enable widgets for your server and copy the server ID so that a nice looking server overview can be displayed for you.'
  },
  {
    name: AuthorFieldNames.categories,
    label: 'Categories',
    type: 'multichoice',
    options: Object.entries(AssetCategories).map(([key, value]) => ({
      label: key,
      value
    })),
    default: []
  }
]
