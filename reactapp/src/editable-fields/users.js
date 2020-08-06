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
    type: fieldTypes.checkbox
  },
  {
    name: UserFieldNames.avatarUrl,
    label: 'Avatar image URL',
    type: fieldTypes.text,
    hint: 'Should be 200 x 200 png'
  }
]
