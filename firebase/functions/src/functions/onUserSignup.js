const functions = require('firebase-functions')
const {
  db,
  CollectionNames,
  UserFieldNames,
  ProfileFieldNames,
} = require('../firebase')
const { emitToDiscordActivity, getEmbedForViewProfile } = require('../discord')
const { storeInHistory } = require('../history')

module.exports = functions.auth.user().onCreate(async (user) => {
  const { uid } = user

  const userRecord = db.collection(CollectionNames.Users).doc(uid)

  await userRecord.set({
    isAdmin: false,
    isEditor: false,
    [UserFieldNames.isBanned]: false,
    [UserFieldNames.banReason]: '',
    username: '',
  })

  const profileRecord = db.collection(CollectionNames.Profiles).doc(uid)

  await profileRecord.set({
    [ProfileFieldNames.bio]: '',
  })

  await emitToDiscordActivity(`User ${uid} signed up`, [
    getEmbedForViewProfile(uid),
  ])

  return storeInHistory(`User signup`, userRecord)
})
