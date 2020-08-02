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
    name: AuthorFieldNames.twitterUsername,
    label: 'Twitter Username (without @)',
    type: 'text',
    default: ''
  },
  {
    name: AuthorFieldNames.gumroadUsername,
    label: 'Gumroad Username',
    type: 'text',
    default: ''
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
