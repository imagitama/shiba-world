import { UserFieldNames } from '../hooks/useDatabaseQuery'
import { fieldTypes } from '../generic-forms'

export default [
  {
    name: UserFieldNames.username,
    label: 'Username',
    type: fieldTypes.text,
    isRequired: true
  },
  {
    name: UserFieldNames.enabledAdultContent,
    label: 'Has adult content enabled',
    type: fieldTypes.checkbox,
    default: false
  },
  {
    name: UserFieldNames.avatarUrl,
    label: 'Avatar image URL',
    type: fieldTypes.imageUpload,
    fieldProperties: {
      width: 200,
      height: 200
    },
    hint: 'Should be 200 x 200 png',
    default: ''
  },
  {
    name: UserFieldNames.isBanned,
    label: 'Is user banned',
    type: fieldTypes.checkbox,
    hint:
      'They will be notified of this at the top of the site. They will not be able to perform any actions on the site (create comments, edit assets, etc.)',
    default: false
  },
  {
    name: UserFieldNames.banReason,
    label: 'Ban reason',
    type: fieldTypes.text,
    hint: 'They will see this message at the top of the site.',
    default: ''
  }
]
