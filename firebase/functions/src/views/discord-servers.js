const {
  CollectionNames,
  OrderDirections,
  DiscordServerFieldNames,
  Operators,
} = require('../firebase')
const { basicTest } = require('./mappers')

const getDefinition = ({
  direction,
  isDeleted = false,
  isUnapproved = false,
}) => ({
  sources: [
    {
      collectionName: CollectionNames.DiscordServers,
      where: isDeleted
        ? [[DiscordServerFieldNames.isDeleted, Operators.EQUALS, true]]
        : isUnapproved
        ? [[DiscordServerFieldNames.isApproved, Operators.EQUALS, false]]
        : [
            [DiscordServerFieldNames.isDeleted, Operators.EQUALS, false],
            [DiscordServerFieldNames.isApproved, Operators.EQUALS, true],
          ],
      order: [DiscordServerFieldNames.name, direction],
      map: (item) => ({
        [DiscordServerFieldNames.name]: item[DiscordServerFieldNames.name],
        [DiscordServerFieldNames.iconUrl]:
          item[DiscordServerFieldNames.iconUrl],
      }),
      test: basicTest,
    },
  ],
})

module.exports['view-discord-servers_isDeleted_name_asc'] = getDefinition({
  isDeleted: true,
  direction: OrderDirections.ASC,
})
module.exports['view-discord-servers_isDeleted_name_desc'] = getDefinition({
  isDeleted: true,
  direction: OrderDirections.DESC,
})

module.exports['view-discord-servers_isUnapproved_name_asc'] = getDefinition({
  isUnapproved: true,
  direction: OrderDirections.ASC,
})
module.exports['view-discord-servers_isUnapproved_name_desc'] = getDefinition({
  isUnapproved: true,
  direction: OrderDirections.DESC,
})

module.exports['view-discord-servers_name_asc'] = getDefinition({
  direction: OrderDirections.ASC,
})
module.exports['view-discord-servers_name_desc'] = getDefinition({
  direction: OrderDirections.DESC,
})
