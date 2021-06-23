const functions = require('firebase-functions')
const { UserFieldNames } = require('../firebase')
const { getUserFromFirestore } = require('../users')
const { bulkEditTags } = require('../tags')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
        throw new Error('Only logged in users can call this function!')
    }
    
    const userId = context.auth.uid

    const { [UserFieldNames.isAdmin]: isAdmin } = await getUserFromFirestore(userId)

    if (!isAdmin) {
        throw new Error(
            'Only admins can call this function!'
        )
    }

    const { assetIds, operationName, tag, additionalTag } = data

    return bulkEditTags(userId, assetIds, operationName, tag, additionalTag)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-bulk-edit-tags',
      err.message
    )
  }
})
