const functions = require('firebase-functions')
const { getProductInfoByCode } = require('../gumroad')

module.exports = functions.https.onCall(async (data) => {
  try {
    const code = data.code

    if (!code) {
      throw new Error('Need to pass code')
    }

    return getProductInfoByCode(code)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError(
      'failed-to-fetch-gumroad-info',
      err.message
    )
  }
})
