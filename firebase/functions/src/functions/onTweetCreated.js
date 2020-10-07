const functions = require('firebase-functions')
const { sendTweet, updateTweetRecordInDatabase } = require('../twitter')

module.exports = functions.firestore
  .document('tweets/{tweetId}')
  .onCreate(async (doc) => {
    const docData = doc.data()

    const tweetId = await sendTweet(docData.status)

    await updateTweetRecordInDatabase(doc.id, tweetId)
  })
