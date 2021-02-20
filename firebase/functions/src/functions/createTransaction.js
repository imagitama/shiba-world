const functions = require('firebase-functions')
const { createTransaction } = require('../transactions')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new Error('Only logged in users can create transactions!')
    }

    const nonce = data.nonce
    const productId = data.productId
    const priceUsd = data.priceUsd
    const userId = context.auth.uid

    if (!nonce) {
      throw new Error('Cannot create transaction without nonce!')
    }

    if (!productId) {
      throw new Error('Cannot create transaction without product ID!')
    }

    if (!priceUsd) {
      throw new Error('Cannot create transaction without price!')
    }

    const { transactionId } = await createTransaction(
      nonce,
      userId,
      productId,
      priceUsd
    )

    return { transactionId }
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
