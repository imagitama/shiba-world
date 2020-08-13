import { CollectionNames } from '../hooks/useDatabaseQuery'
import authors from './authors'
import users from './users'
import discordServers from './discord-servers'

export default {
  [CollectionNames.Authors]: authors,
  [CollectionNames.Users]: users,
  [CollectionNames.DiscordServers]: discordServers
}
