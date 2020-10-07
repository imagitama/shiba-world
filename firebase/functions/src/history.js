const { db, CollectionNames } = require('./firebase')

module.exports.storeInHistory = async (message, parentRef, data, user) => {
  return db.collection(CollectionNames.History).add({
    message,
    parent: parentRef,
    data,
    createdAt: new Date(),
    createdBy: user,
  })
}
