const braintree = require('braintree')
const { db, CollectionNames, TransactionFieldNames } = require('./firebase')
const config = require('./config')

const BrainTreeTransactionStatus = {
  PENDING: 'Pending',
}

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

async function getTransaction(transactionId, braintreeTransactionid) {
  console.debug(`get transaction ${transactionId} ${braintreeTransactionid}`)

  if (!braintreeTransactionid) {
    throw new Error('At this time we need a braintree ID')
  }

  // todo: if braintreeTransactionid not provided look up the transaction

  const result = await getGateway().transaction.find(braintreeTransactionid)

  await hydrateTransaction(transactionId, result)

  return result
}
module.exports.getTransaction = getTransaction
