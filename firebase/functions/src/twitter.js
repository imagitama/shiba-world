const Twit = require('twit')
const config = require('./config')
const { db, CollectionNames } = require('./firebase')

const IS_TWITTER_ENABLED = config.global.isTwitterEnabled !== 'false'
const TWITTER_CONSUMER_KEY = config.twitter.consumer_key
const TWITTER_CONSUMER_SECRET = config.twitter.consumer_secret
const TWITTER_ACCESS_TOKEN_KEY = config.twitter.access_token_key
const TWITTER_ACCESS_TOKEN_SECRET = config.twitter.access_token_secret

let twitterClient

function getTwitterClient() {
  if (twitterClient) {
    return twitterClient
  }

  twitterClient = new Twit({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token: TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
  })
  return twitterClient
}

module.exports.sendTweet = (status) => {
  if (!IS_TWITTER_ENABLED) {
    return Promise.resolve('1234')
  }

  return getTwitterClient()
    .post('statuses/update', {
      status,
    })
    .then(({ data }) => data.id)
}

module.exports.insertTweetRecordInDatabase = (status) => {
  console.debug('Inserting tweet', status)
  return db.collection(CollectionNames.Tweets).add({
    status,
    createdAt: new Date(),
  })
}

module.exports.updateTweetRecordInDatabase = (recordId, tweetId) => {
  return db.collection(CollectionNames.Tweets).doc(recordId).update({
    tweetId,
    tweetedAt: new Date(),
  })
}
