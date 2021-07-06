const { HistoryFieldNames, OrderDirections } = require('../../firebase')

module.exports['activity_createdAt_desc'] = {
  sources: [
    {
      collectionName: 'history',
      order: [HistoryFieldNames.createdAt, OrderDirections.DESC],
      limit: 100,
    },
  ],
}
