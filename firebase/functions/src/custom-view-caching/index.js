const fs = require('fs')
const path = require('path')

module.exports = fs.readdirSync(path.resolve(__dirname, 'views')).reduce(
  (results, fileName) => ({
    ...results,
    ...require(path.resolve(__dirname, 'views', fileName)),
  }),
  {}
)
