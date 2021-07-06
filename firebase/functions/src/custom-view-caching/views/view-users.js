const {
  CollectionNames,
  OrderDirections,
  UserFieldNames,
} = require('../../firebase')

const getView = (orderDir) => ({
  sources: [
    {
      collectionName: CollectionNames.Users,
      order: [UserFieldNames.createdAt, orderDir],
      map: (item) => ({
        [UserFieldNames.username]: item[UserFieldNames.username],
        [UserFieldNames.avatarUrl]: item[UserFieldNames.avatarUrl],
        [UserFieldNames.isEditor]: item[UserFieldNames.isEditor],
        [UserFieldNames.isAdmin]: item[UserFieldNames.isAdmin],
      }),
      test: (itemBefore, itemAfter) => {
        if (
          itemBefore[UserFieldNames.username] !==
          itemAfter[UserFieldNames.username]
        ) {
          return false
        }
        if (
          itemBefore[UserFieldNames.avatarUrl] !==
          itemAfter[UserFieldNames.avatarUrl]
        ) {
          return false
        }
        if (
          itemBefore[UserFieldNames.isEditor] !==
          itemAfter[UserFieldNames.isEditor]
        ) {
          return false
        }
        if (
          itemBefore[UserFieldNames.isAdmin] !==
          itemAfter[UserFieldNames.isAdmin]
        ) {
          return false
        }
        return true
      },
    },
  ],
})

module.exports['view-users_createdAt_asc'] = getView(OrderDirections.ASC)
module.exports['view-users_createdAt_desc'] = getView(OrderDirections.DESC)
