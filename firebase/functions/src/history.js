const { db, CollectionNames } = require('./firebase')

module.exports.storeInHistory = async (message, parentRef, data, userRef) => {
  console.debug('Store in history', message)
  return db.collection(CollectionNames.History).add({
    message,
    parent: parentRef,
    data,
    createdAt: new Date(),
    createdBy: userRef,
  })
}
