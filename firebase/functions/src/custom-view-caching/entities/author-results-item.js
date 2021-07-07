const { AuthorFieldNames } = require('../../firebase')

module.exports.map = (item) => ({
  [AuthorFieldNames.name]: item[AuthorFieldNames.name],
  [AuthorFieldNames.isOpenForCommission]:
    item[AuthorFieldNames.isOpenForCommission],
  [AuthorFieldNames.avatarUrl]: item[AuthorFieldNames.avatarUrl],
})
