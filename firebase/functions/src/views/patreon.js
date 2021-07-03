const {
  CollectionNames,
  UserMetaFieldNames,
  Operators,
  UserFieldNames,
  OrderDirections,
} = require('../firebase')
const { basicTest } = require('./mappers')

module.exports['patreon_username_desc'] = {
  sources: [
    {
      collectionName: CollectionNames.UserMeta,
      where: [[UserMetaFieldNames.isPatron, Operators.EQUALS, true]],
      map: (item) => ({
        [UserMetaFieldNames.isPatron]: item[UserMetaFieldNames.isPatron],
      }),
      test: basicTest,
      join: {
        collectionName: CollectionNames.Users,
        map: (item) => ({
          [UserFieldNames.username]: item[UserFieldNames.username],
          [UserFieldNames.avatarUrl]: item[UserFieldNames.avatarUrl],
        }),
        test: basicTest,
        order: [UserFieldNames.username, OrderDirections.DESC],
      },
    },
  ],
}
