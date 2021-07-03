const {
  OrderDirections,
  CollectionNames,
  UserFieldNames,
  Operators,
  ProfileFieldNames,
} = require('../firebase')
const { basicTest } = require('./mappers')

const getDefinition = (direction) => ({
  sources: [
    {
      collectionName: CollectionNames.Profiles,
      where: [[ProfileFieldNames.twitchUsername, Operators.GREATER_THAN, '']],
      map: (item) => ({
        [ProfileFieldNames.twitchUsername]:
          item[ProfileFieldNames.twitchUsername],
      }),
      test: basicTest,
      join: {
        collectionName: CollectionNames.Users,
        map: (item) => ({
          [UserFieldNames.username]: item[UserFieldNames.username],
          [UserFieldNames.avatarUrl]: item[UserFieldNames.avatarUrl],
        }),
        test: basicTest,
        order: [UserFieldNames.username, direction],
      },
    },
  ],
})

module.exports['streams_username_desc'] = getDefinition(OrderDirections.DESC)
module.exports['streams_username_asc'] = getDefinition(OrderDirections.ASC)
