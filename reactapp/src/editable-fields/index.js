import { CollectionNames } from '../hooks/useDatabaseQuery'
import authors from './authors'
import users from './users'

export default {
  [CollectionNames.Authors]: authors,
  [CollectionNames.Users]: users
}
