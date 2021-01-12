const {
  db,
  CollectionNames,
  NotificationsFieldNames,
  UserFieldNames,
  Operators,
} = require('./firebase')

const storeInNotifications = (
  message,
  parentRef,
  recipientRef,
  data = null
) => {
  console.debug('Storing notification', message, recipientRef.id)
  return db.collection(CollectionNames.Notifications).add({
    [NotificationsFieldNames.message]: message,
    [NotificationsFieldNames.parent]: parentRef,
    [NotificationsFieldNames.recipient]: recipientRef,
    [NotificationsFieldNames.isRead]: false,
    [NotificationsFieldNames.data]: data,
    [NotificationsFieldNames.createdAt]: new Date(),
  })
}
module.exports.storeInNotifications = storeInNotifications

const getTaggedNotificationRecipientByUsername = (username) => {
  return db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.username, Operators.EQUALS, username)
    .get()
}

module.exports.notifyTaggedUserIfNeeded = async (
  commentMessage,
  parentRef,
  taggerRef
) => {
  if (commentMessage[0] !== '@') {
    return Promise.resolve()
  }

  const commentMessageWithAtSymbol = commentMessage.substr(1)

  // Does NOT support username with spaces yet
  const chunks = commentMessageWithAtSymbol.split(' ')
  const username = chunks[0]

  const recipientRefs = await getTaggedNotificationRecipientByUsername(username)

  if (recipientRefs.empty || recipientRefs.docs.length !== 1) {
    return Promise.resolve()
  }

  const recipientRef = recipientRefs.docs[0].ref

  return storeInNotifications('Tagged user', parentRef, recipientRef, {
    author: taggerRef,
  })
}
