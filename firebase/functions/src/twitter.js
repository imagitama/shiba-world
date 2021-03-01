const Twit = require('twit')
const config = require('./config')
const { db, CollectionNames } = require('./firebase')
const { downloadImageUrl } = require('./apis')

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

const isValidImage = (url) => url.includes('jpg') || url.includes('png')

module.exports.getTweetById = async (id, downloadAttachedImage = false) => {
  const { data: tweet } = await getTwitterClient().get(`statuses/show/${id}`, {
    include_entities: true,
  })
  let imageUrl

  // https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/get-statuses-show-id
  if (
    downloadAttachedImage &&
    tweet.entities &&
    tweet.entities.media &&
    tweet.entities.media.length
  ) {
    const firstMedia = tweet.entities.media[0]
    const firstMediaUrl = firstMedia.media_url_https

    if (firstMediaUrl && isValidImage(firstMediaUrl)) {
      imageUrl = await downloadImageUrl(firstMediaUrl, 'tweet-images')
    }
  }

  if (imageUrl) {
    return {
      ...tweet,
      imageUrl,
    }
  }

  return tweet
}
