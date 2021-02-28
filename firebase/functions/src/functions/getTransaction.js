const functions = require('firebase-functions')
const { getTransaction } = require('../transactions')

module.exports = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new Error('Only logged in users can view transactions!')
    }

    const transactionId = data.transactionId
    const braintreeTransactionId = data.braintreeTransactionId
    // const userId = context.auth.uid

    if (!transactionId) {
      throw new Error('Cannot view transaction without transaction ID!')
    }

    return getTransaction(transactionId, braintreeTransactionId)
  } catch (err) {
    console.error(err)
    throw new functions.https.HttpsError('unknown', err.message)
  }
})
