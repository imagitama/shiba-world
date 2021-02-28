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
// import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Message from '../../components/message'
import ProductResultsItem from '../../components/product-results-item'
import Heading from '../../components/heading'
import Price from '../../components/price'
import Button from '../../components/button'
import Status from '../../components/transaction-status'
import SuccessMessage from '../../components/success-message'
import FormattedDate from '../../components/formatted-date'
// import NoPermissionMessage from '../../components/no-permission-message'

import * as routes from '../../routes'
import { callFunction } from '../../firebase'
import { BraintreeStatus } from '../../braintree'
import { DISCORD_URL, EMAIL } from '../../config'
// import { canViewTransaction } from '../../permissions'

function StatusMessage({ status, onClickLearnMore }) {
  switch (status) {
    case BraintreeStatus.Failed:
    case BraintreeStatus.Voided:
    case BraintreeStatus.SettlementDeclined:
    case BraintreeStatus.AuthorizationExpired:
      return <ErrorMessage>Transaction incomplete</ErrorMessage>
    case BraintreeStatus.Settled:
    case BraintreeStatus.Settling:
      return <SuccessMessage>Transaction complete</SuccessMessage>
    case BraintreeStatus.ProcessorDeclined:
      return (
        <ErrorMessage>
          Payment processor declined
          <br />
          <br />
          <Button onClick={onClickLearnMore}>Learn More</Button>
        </ErrorMessage>
      )
    default:
      return <Message>State: {status}</Message>
  }
}

function ExplanationMessage({ status, onDoneClick }) {
  switch (status) {
    case BraintreeStatus.ProcessorDeclined:
      return (
        <Message>
          <strong>Why is my payment process declined?</strong>
          <br />
          It could be one of these reasons:
          <ul>
            <li>Incorrect credit card number or expiration date</li>
            <li>Insufficient funds</li>
            <li>The bank declined based on location</li>
            <li>The bank's fraud rules blocked the transaction</li>
          </ul>
          <Button onClick={onDoneClick}>I understand</Button>
        </Message>
      )
    default:
      return <Message>Unknown</Message>
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

export default ({
  match: {
    params: { transactionId }
  }
}) => {
  // const [, , user] = useUserRecord()
  // const hasPermission = canViewTransaction(user)

  const [isLoading, isError, transaction] = useDatabaseQuery(
    CollectionNames.Transactions,
    transactionId,
    {
      [options.populateRefs]: true,
      [options.subscribe]: true
    }
  )
  const [isExplanationVisible, setIsExplanationVisible] = useState(false)
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

  // if (!hasPermission) {
  //   return <NoPermissionMessage />
  // }

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
      <StatusMessage
        status={status}
        onClickLearnMore={() =>
          setIsExplanationVisible(currentVal => !currentVal)
        }
      />
      {isExplanationVisible && (
        <ExplanationMessage
          status={status}
          onDoneClick={() => setIsExplanationVisible(currentVal => !currentVal)}
        />
      )}
      <Heading variant="h2">Details</Heading>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>
              <Price price={braintreeTransactionData.amount} />
            </TableCell>
          </TableRow>
          {braintreeTransactionData.creditCard.last4 && (
            <TableRow>
              <TableCell>Credit Card Number</TableCell>
              <TableCell>
                {braintreeTransactionData.creditCard.maskedNumber}
              </TableCell>
            </TableRow>
          )}
          {braintreeTransactionData.paypal.payerEmail && (
            <TableRow>
              <TableCell>PayPal Email</TableCell>
              <TableCell>
                {braintreeTransactionData.paypal.payerEmail}
              </TableCell>
            </TableRow>
          )}
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
      <Heading variant="h2">Support</Heading>
      <Message>
        Please join our <a href={DISCORD_URL}>Discord server</a> or email{' '}
        {EMAIL} for any problems with your transaction (please quote your
        transaction ID).
      </Message>
      <Heading variant="h2">History</Heading>
      <TransactionHistory history={braintreeTransactionData.statusHistory} />
    </div>
  )
}
