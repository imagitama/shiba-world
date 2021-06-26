const functions = require('firebase-functions')
const {
    db,
  CollectionNames,
  ConversationFieldNames,
  PrivateMessageFieldNames
} = require('../firebase')

module.exports = functions.firestore
  .document(`${CollectionNames.PrivateMessages}/{id}`)
  .onCreate(async (doc) => {
    // read conversation
    // if not a member
    // add
    
    const docData = doc.data()
    const convoRef = docData[PrivateMessageFieldNames.conversation]
    const convoDoc = await convoRef.get()
    const convoDocData = convoDoc.data()
    const creatorRef = docData[PrivateMessageFieldNames.createdBy]
    const members = convoDocData[ConversationFieldNames.members]

    // if already in convo
    if (members.find(memberRef => memberRef.id === creatorRef.id)) {
        console.debug(`user "${creatorRef.id}" is already in the convo (${members.length} members), skipping...`)
        return
    }

    console.debug(`adding user "${creatorRef.id}" is to convo (${members.length} existing members)`)

    await convoRef.set({
        [ConversationFieldNames.members]: convoDocData[ConversationFieldNames.members].concat([creatorRef])
     }, { merge: true })
  })