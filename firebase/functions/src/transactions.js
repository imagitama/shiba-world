const braintree = require('braintree')
const {
  db,
  CollectionNames,
  TransactionFieldNames,
  Operators,
} = require('./firebase')
const config = require('./config')

// const BrainTreeTransactionStatus = {
//   PENDING: 'Pending',
// }

let gateway
const BRAINTREE_MERCHANT_ID = config.braintree.merchant_id
const BRAINTREE_PUBLIC_KEY = config.braintree.public_key
const BRAINTREE_PRIVATE_KEY = config.braintree.private_key

function getGateway() {
  if (!gateway) {
    console.debug('Create braintree gateway')

    gateway = new braintree.BraintreeGateway({
      environment: braintree.Environment.Sandbox,
      merchantId: BRAINTREE_MERCHANT_ID,
      publicKey: BRAINTREE_PUBLIC_KEY,
      privateKey: BRAINTREE_PRIVATE_KEY,
    })
  }
  return gateway
}

async function createTransaction(nonce, userId, productId, priceUsd) {
  console.debug(
    `Creating transaction - nonce ${nonce} user ${userId} product ${productId}`
  )

  const newDoc = db.collection(CollectionNames.Transactions).doc()
  const transactionId = newDoc.id

  await newDoc.set({
    [TransactionFieldNames.product]: db
      .collection(CollectionNames.Products)
      .doc(productId),
    [TransactionFieldNames.customer]: db
      .collection(CollectionNames.Users)
      .doc(userId),
    [TransactionFieldNames.priceUsd]: priceUsd,
    [TransactionFieldNames.status]: null,
    createdAt: new Date(),
  })

  console.debug(`Created transaction ${transactionId}`)

  const {
    transaction: braintreeTransaction,
  } = await getGateway().transaction.sale({
    amount: priceUsd,
    paymentMethodNonce: nonce,
    options: {
      submit_for_settlement: true,
    },
  })

  console.debug(`Created braintree transaction ${braintreeTransaction.id}`)

  await hydrateTransaction(transactionId, braintreeTransaction)

  return {
    transactionId,
  }
}
module.exports.createTransaction = createTransaction

async function getToken() {
  console.debug('Getting token')

  const { clientToken } = await getGateway().clientToken.generate()

  console.debug(`Got token: ${clientToken}`)

  return clientToken
}
module.exports.getToken = getToken

/*
AuthorizationExpired
Authorized
Authorizing
SettlementPending
SettlementDeclined
Failed
GatewayRejected
ProcessorDeclined
Settled
Settling
SubmittedForSettlement
Voided
*/
const mapBraintreeTransactionStatusToInternalStatus = (braintreeStatus) =>
  braintreeStatus

const convertBraintreeTransactionToBasicObject = (braintreeTransaction) =>
  JSON.parse(JSON.stringify(braintreeTransaction))

// https://developers.braintreepayments.com/reference/response/transaction/node
async function hydrateTransaction(transactionId, braintreeTransaction) {
  console.debug('Hydrate transaction', transactionId)

  return db
    .collection(CollectionNames.Transactions)
    .doc(transactionId)
    .set(
      {
        [TransactionFieldNames.braintreeTransactionId]: braintreeTransaction.id, // set this here as create uses this same func
        [TransactionFieldNames.status]: mapBraintreeTransactionStatusToInternalStatus(
          braintreeTransaction.status
        ),
        [TransactionFieldNames.braintreeTransactionData]: convertBraintreeTransactionToBasicObject(
          braintreeTransaction
        ),
        [TransactionFieldNames.lastModifiedAt]: new Date(),
      },
      {
        merge: true,
      }
    )
}

async function getTransaction(transactionId, braintreeTransactionId) {
  console.debug(`get transaction ${transactionId} ${braintreeTransactionId}`)

  if (!braintreeTransactionId) {
    throw new Error('At this time we need a braintree ID')
  }

  // todo: if braintreeTransactionid not provided look up the transaction

  const result = await getGateway().transaction.find(braintreeTransactionId)

  await hydrateTransaction(transactionId, result)

  return result
}
module.exports.getTransaction = getTransaction

async function hydrateTransactionByBraintreeId(braintreeTransactionId) {
  console.debug('Hydrate transaction with braintree ID', braintreeTransactionId)

  const { docs } = await db
    .collection(CollectionNames.Transactions)
    .where(
      TransactionFieldNames.braintreeTransactionId,
      Operators.EQUALS,
      braintreeTransactionId
    )
    .get()

  if (docs.length === 1) {
    const transactionDoc = docs[0]
    await getTransaction(transactionDoc.id, braintreeTransactionId)
  } else {
    throw new Error(
      `Could not hydrate transaction with braintree ID ${braintreeTransactionId}: ${docs.length} transactions found!`
    )
  }

  // .set(
  //   {
  //     [TransactionFieldNames.braintreeTransactionId]: braintreeTransaction.id, // set this here as create uses this same func
  //     [TransactionFieldNames.status]: mapBraintreeTransactionStatusToInternalStatus(
  //       braintreeTransaction.status
  //     ),
  //     [TransactionFieldNames.braintreeTransactionData]: convertBraintreeTransactionToBasicObject(
  //       braintreeTransaction
  //     ),
  //     [TransactionFieldNames.lastModifiedAt]: new Date(),
  //   },
  //   {
  //     merge: true,
  //   }
  // )
}

// https://developers.braintreepayments.com/guides/webhooks/parse/node
async function handleWebhook(body) {
  const signature = body.bt_signature
  const payload = body.bt_payload

  if (!signature) {
    throw new Error(`Failed to handle webhook: signature is required!`)
  }
  if (!payload) {
    throw new Error(`Failed to handle webhook: payload is required!`)
  }

  console.debug(`handling webhook ${signature} ${payload}`)

  const notification = await getGateway().webhookNotification.parse(
    signature,
    payload
  )

  console.debug(
    `transaction notification ${notification.timestamp} ${notification.kind}`
  )

  if (notification.transaction) {
    // we could hydate the transaction using the provided data
    // but easier just to go through our regular hydration system
    await hydrateTransactionByBraintreeId(notification.transaction.id)
  } else {
    console.debug('not a transaction - ignoring...')
    return Promise.resolve()
  }
}
module.exports.handleWebhook = handleWebhook
