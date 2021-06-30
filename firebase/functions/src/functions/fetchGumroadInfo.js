const functions = require('firebase-functions')
const { getProductInfoByAuthorSubdomainAndCode } = require('../gumroad')

module.exports = functions.https.onCall(async (data) => {
  try {
    const code = data.code

    if (!code) {
      throw new Error('Need to pass code')
    }

    const authorSubdomain = data.authorSubdomain

    if (!authorSubdomain) {
      throw new Error('Need to pass author subdomain')
    }

    return getProductInfoByAuthorSubdomainAndCode(authorSubdomain, code)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-fetch-gumroad-info',
      err.message
    )
  }
})
