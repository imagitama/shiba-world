import { AssetCategories, AuthorFieldNames } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'
import {
  THUMBNAIL_WIDTH,
  THUMBNAIL_HEIGHT,
  BANNER_WIDTH,
  BANNER_HEIGHT
} from '../config'

export default [
  {
    name: AuthorFieldNames.name,
    label: 'Name',
    type: fieldTypes.text,
    isRequired: true
  },
  {
    name: AuthorFieldNames.description,
    label: 'Description',
    type: fieldTypes.textMarkdown,
    default: ''
  },
  {
    name: AuthorFieldNames.avatarUrl,
    label: 'Avatar',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
      directoryName: 'author-avatars',
      fallbackFieldName: AuthorFieldNames.fallbackAvatarUrl
    },
    default: ''
  },
  {
    name: AuthorFieldNames.websiteUrl,
    label: 'Website URL',
    type: fieldTypes.text,
    default: ''
  },
  {
    name: AuthorFieldNames.email,
    label: 'Email',
    type: fieldTypes.text,
    default: '',
    hint: 'Warning: Bots can find this URL so your spam inbox will be flooded!'
  },
  {
    name: AuthorFieldNames.twitterUsername,
    label: 'Twitter Username (without @)',
    type: fieldTypes.text,
    default: ''
  },
  {
    name: AuthorFieldNames.gumroadUsername,
    label: 'Gumroad Username',
    type: fieldTypes.text,
    default: '',
    hint:
      'eg. Tosca is "xtosca" which is from their profile URL https://gumroad.com/xtosca'
  },
  {
    name: AuthorFieldNames.discordUsername,
    label: 'Discord Username',
    type: fieldTypes.text,
    default: '',
    hint:
      'Your personal Discord username. Usually contains a hash and 4 digits ie PeanutBuddha#1234'
  },
  {
    name: AuthorFieldNames.discordServerInviteUrl,
    label: 'Discord Server Invite URL',
    type: fieldTypes.text,
    default: '',
    hint:
      'A URL people can visit to join your Discord server. eg. https://discord.gg/gpD7fq Is hidden if server ID is provided'
  },
  {
    name: AuthorFieldNames.discordServerId,
    label: 'Discord Server ID',
    type: fieldTypes.text,
    default: '',
    hint:
      'Enable widgets for your server and copy the server ID so that a nice looking server overview can be displayed for you.'
  },
  {
    name: AuthorFieldNames.patreonUsername,
    label: 'Patreon username',
    type: fieldTypes.text,
    default: '',
    hint: 'The name in the URL like https://patreon.com/[username]'
  },
  {
    name: AuthorFieldNames.categories,
    label: 'Categories',
    type: fieldTypes.multichoice,
    options: Object.entries(AssetCategories).map(([key, value]) => ({
      label: key,
      value
    })),
    default: []
  },
  {
    name: AuthorFieldNames.bannerUrl,
    label: 'Banner',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: BANNER_WIDTH,
      height: BANNER_HEIGHT,
      directoryName: 'author-banners',
      fallbackFieldName: AuthorFieldNames.fallbackBannerUrl
    },
    default: ''
  },
  {
    name: AuthorFieldNames.isOpenForCommission,
    label: 'Open for commissions',
    type: fieldTypes.checkbox,
    default: false,
    hint:
      'Shows a message for your author page that you are open for commissions with optional text.'
  },
  {
    name: AuthorFieldNames.showCommissionStatusForAssets,
    label: 'Show in assets',
    type: fieldTypes.checkbox,
    default: true,
    hint:
      'Show a message at the top of each asset you have published that you are open or closed for commissions.'
  },
  {
    name: AuthorFieldNames.commissionInfo,
    label: 'Commission info',
    type: fieldTypes.textMarkdown,
    default: '',
    hint:
      'Explain what you offer, your prices, links to work you have done. You can use Markdown so you can embed images and links.'
  }
]
