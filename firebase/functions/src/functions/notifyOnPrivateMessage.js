const functions = require('firebase-functions')
const {
    CollectionNames,
  PrivateMessageFieldNames,
  ConversationFieldNames
} = require('../firebase')
const {
  sendNotification,
  NotificationEvents,
  NotificationMethods
} = require('../notifications')
const siteSettings = require('../site')

const getEmail = (convoId) => {
    const conversationUrl = siteSettings.routes.viewConversationWithVar.replace(':conversationId', convoId)

    const text = `Hello from VRCArena,
      
Someone has sent a message in a conversation you are a part of: ${conversationUrl}

Regards,

VRCArena`

    const html = `Hello from VRCArena,
<br /><br />
Someone has sent a message in a <a href="${conversationUrl}">conversation</a> you are a part of.
<br /><br />
Regards,
<br /><br />
VRCArena`

    return {
        text,
        html
    }
}

module.exports = functions.firestore
  .document(`${CollectionNames.PrivateMessages}/{id}`)
  .onCreate(async (doc) => {
    const docData = doc.data()

    const creatorRef = docData[PrivateMessageFieldNames.createdBy]
    const convoRef = docData[PrivateMessageFieldNames.conversation]
    const convoDoc = await convoRef.get()
    const convoData = convoDoc.data()
    const members = convoData[ConversationFieldNames.members]

    const membersWithoutCreator = members.filter(memberRef => memberRef.id !== creatorRef.id)

    console.debug(`sending notification to ${membersWithoutCreator.length} members of the convo (without sender)`)

    const { text, html } = getEmail(convoRef.id)

    for (const memberRef of membersWithoutCreator) {
        await sendNotification(
            NotificationEvents.PRIVATE_MESSAGE_RECEIVED,
            convoRef,
            memberRef,
            {
            },
            {
                [NotificationMethods.EMAIL]: {
                    text,
                    html,
                },
            }
        )
    }
  })
