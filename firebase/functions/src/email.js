const admin = require('firebase-admin')
const {
  db,
  CollectionNames,
  UserFieldNames,
  ProfileFieldNames,
} = require('./firebase')

module.exports.notifyUsersOfUnapprovedAsset = async (assetId, assetData) => {
  const { docs: editorUsers } = await db
    .collection(CollectionNames.Users)
    .where(UserFieldNames.isEditor, '==', true)
    .get()

  let recipientEmails = []

  /* eslint-disable no-await-in-loop */
  for (user of editorUsers) {
    // Awaiting like this will cause a bottleneck with a lot of results as it does it in sequence
    const profileDoc = await db
      .collection(CollectionNames.Profiles)
      .doc(user.id)
      .get()

    if (!profileDoc.exists) {
      continue
    }

    const profileData = profileDoc.data()

    if (profileData[ProfileFieldNames.notificationEmail]) {
      recipientEmails.push(profileData[ProfileFieldNames.notificationEmail])
      continue
    }

    if (profileData[ProfileFieldNames.notifyOnUnapprovedAssets]) {
      const authUser = await admin.auth().getUser(user.id)
      recipientEmails.push(authUser.email)
    }
  }

  if (!recipientEmails.length) {
    return Promise.resolve()
  }

  const emailText = `Hi. The asset ${assetData.title} with ID ${assetId} has just been created and is waiting for approval :)`

  return db.collection(CollectionNames.Mail).add({
    // BCC = blind carbon copy = others cant see it
    bcc: recipientEmails,
    message: {
      subject: 'New unapproved asset at VRCArena',
      text: emailText,
      html: emailText,
    },
  })
}
