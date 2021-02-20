import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'

import useDatabaseQuery, {
  CollectionNames,
  options,
  TransactionFieldNames
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Message from '../../components/message'
import ProductResultsItem from '../../components/product-results-item'
import Heading from '../../components/heading'
import Price from '../../components/price'
import * as routes from '../../routes'
import { callFunction } from '../../firebase'
import SuccessMessage from '../../components/success-message'
import FormattedDate from '../../components/formatted-date'

const BraintreeStatus = {
  AuthorizationExpired: 'authorizationexpired',
  Authorized: 'authorized',
  Authorizing: 'authorizing',
  SettlementPending: 'settlementpending',
  SettlementDeclined: 'settlementdeclined',
  Failed: 'failed',
  GatewayRejected: 'gatewayrejected',
  ProcessorDeclined: 'processordeclined',
  Settled: 'settled',
  Settling: 'settling',
  SubmittedForSettlement: 'submittedforsettlement',
  Voided: 'voided'
}

function StatusMessage({ status }) {
  switch (status) {
    case BraintreeStatus.Failed:
    case BraintreeStatus.Voided:
    case BraintreeStatus.SettlementDeclined:
    case BraintreeStatus.AuthorizationExpired:
      return <ErrorMessage>Transaction incomplete</ErrorMessage>
    case BraintreeStatus.Settled:
    case BraintreeStatus.Settling:
      return <SuccessMessage>Transaction complete</SuccessMessage>
    default:
      return <Message>State: {status}</Message>
  }
}

function TransactionHistory({ history }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Amount</TableCell>
          <TableCell>New Status</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {history.map(({ amount, status, timestamp }) => (
          <TableRow key={`${timestamp}_${status}`}>
            <TableCell>
              <Price price={amount} />
            </TableCell>
            <TableCell>
              <Status status={status} />
            </TableCell>
            <TableCell>
              <FormattedDate date={new Date(timestamp)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function Status({ status }) {
  return status
    .toLowerCase()
    .split('_')
    .map(s => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ')
}

export default ({
  match: {
    params: { transactionId }
  }
}) => {
  const [isLoading, isError, transaction] = useDatabaseQuery(
    CollectionNames.Transactions,
    transactionId,
    {
      [options.populateRefs]: true,
      [options.subscribe]: true
    }
  )

  const [asset, setAsset] = useState(null)

  const hydrate = async () => {
    try {
      if (!transaction[TransactionFieldNames.braintreeTransactionId]) {
        throw new Error('Cannot hydrate without a braintree ID')
      }

      console.debug(
        `Hydrating with braintree ID ${
          transaction[TransactionFieldNames.braintreeTransactionId]
        }`
      )

      await callFunction('getTransaction', {
        transactionId,
        braintreeTransactionId:
          transaction[TransactionFieldNames.braintreeTransactionId]
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (!transaction) {
      return
    }

    async function main() {
      console.log(transaction)
      const assetDoc = await transaction.product.asset.get()
      setAsset(assetDoc.data())
    }

    main()
  }, [transaction !== null])

  useEffect(() => {
    if (
      !transaction ||
      !transaction[TransactionFieldNames.braintreeTransactionId]
    ) {
      return
    }

    hydrate()
  }, [
    transaction !== null &&
      transaction[TransactionFieldNames.braintreeTransactionId]
  ])

  if (isLoading) {
    return <LoadingIndicator message="Loading transaction..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load transaction</ErrorMessage>
  }

  if (!transaction) {
    return null
  }

  const {
    product,
    status,
    braintreeTransactionId,
    braintreeTransactionData
  } = transaction

  if (!braintreeTransactionId) {
    return (
      <LoadingIndicator message="Waiting for transaction to be processed..." />
    )
  }

  return (
    <div>
      <Heading variant="h1">View Transaction #{transactionId}</Heading>
      <Link to={routes.viewTransactions}>Back to all transactions</Link>
      <StatusMessage status={status} />
      <Heading variant="h2">Details</Heading>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>
              <Price price={braintreeTransactionData.amount} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Credit Card Number</TableCell>
            <TableCell>
              {braintreeTransactionData.creditCard.maskedNumber}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Last Updated At</TableCell>
            <TableCell>
              <FormattedDate
                date={new Date(braintreeTransactionData.updatedAt)}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Heading variant="h2">Product</Heading>
      <ProductResultsItem
        product={{
          ...product,
          asset
        }}
      />
      <Heading variant="h2">History</Heading>
      <TransactionHistory history={braintreeTransactionData.statusHistory} />
    </div>
  )
}
