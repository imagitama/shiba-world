const { UserFieldNames } = require('../../firebase')

module.exports.map = (item) => ({
  [UserFieldNames.username]: item[UserFieldNames.username],
  [UserFieldNames.avatarUrl]: item[UserFieldNames.avatarUrl],
})
