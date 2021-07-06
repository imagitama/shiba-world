const {
  AuthorFieldNames,
  OrderDirections,
  CollectionNames,
  Operators,
} = require('../../firebase')

const getDefinition = ({
  fieldName,
  direction,
  isOpenForCommission = false,
  admin = false,
}) => ({
  sources: [
    {
      collectionName: CollectionNames.Authors,
      where: admin
        ? [[AuthorFieldNames.isDeleted, Operators.EQUALS, true]]
        : isOpenForCommission
        ? [
            [AuthorFieldNames.isDeleted, Operators.EQUALS, false],
            [AuthorFieldNames.isOpenForCommission, Operators.EQUALS, true],
          ]
        : [[AuthorFieldNames.isDeleted, Operators.EQUALS, false]],
      order: [fieldName, direction],
      map: (item) => ({
        [AuthorFieldNames.name]: item[AuthorFieldNames.name],
        [AuthorFieldNames.createdAt]: item[AuthorFieldNames.createdAt],
        [AuthorFieldNames.isDeleted]: item[AuthorFieldNames.isDeleted],
        [AuthorFieldNames.isOpenForCommission]:
          item[AuthorFieldNames.isOpenForCommission],
      }),
      test: 'basic',
    },
  ],
})

module.exports[`authors_createdAt_asc`] = getDefinition({
  fieldName: AuthorFieldNames.createdAt,
  direction: OrderDirections.ASC,
})
module.exports[`authors_createdAt_desc`] = getDefinition({
  fieldName: AuthorFieldNames.createdAt,
  direction: OrderDirections.DESC,
})
module.exports[`authors_name_asc`] = getDefinition({
  fieldName: AuthorFieldNames.name,
  direction: OrderDirections.ASC,
})
module.exports[`authors_name_desc`] = getDefinition({
  fieldName: AuthorFieldNames.name,
  direction: OrderDirections.DESC,
})

module.exports[`authors-openForCommission_createdAt_asc`] = getDefinition({
  isOpenForCommission: true,
  fieldName: AuthorFieldNames.createdAt,
  direction: OrderDirections.ASC,
})
module.exports[`authors-openForCommission_createdAt_desc`] = getDefinition({
  isOpenForCommission: true,
  fieldName: AuthorFieldNames.createdAt,
  direction: OrderDirections.DESC,
})
module.exports[`authors-openForCommission_name_asc`] = getDefinition({
  isOpenForCommission: true,
  fieldName: AuthorFieldNames.name,
  direction: OrderDirections.ASC,
})
module.exports[`authors-openForCommission_name_desc`] = getDefinition({
  isOpenForCommission: true,
  fieldName: AuthorFieldNames.name,
  direction: OrderDirections.DESC,
})

module.exports[`authors-admin_createdAt_asc`] = getDefinition({
  admin: true,
  fieldName: AuthorFieldNames.createdAt,
  direction: OrderDirections.ASC,
})
module.exports[`authors-admin_createdAt_desc`] = getDefinition({
  admin: true,
  fieldName: AuthorFieldNames.createdAt,
  direction: OrderDirections.DESC,
})
module.exports[`authors-admin_name_asc`] = getDefinition({
  admin: true,
  fieldName: AuthorFieldNames.name,
  direction: OrderDirections.ASC,
})
module.exports[`authors-admin_name_desc`] = getDefinition({
  admin: true,
  fieldName: AuthorFieldNames.name,
  direction: OrderDirections.DESC,
})
