import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import useDatabaseQuery, {
  CollectionNames,
  TransactionFieldNames,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import FormattedDate from '../../components/formatted-date'
import * as routes from '../../routes'
import { createRef } from '../../utils'

function Price({ price, currency = 'usd' }) {
  return `$${price.toFixed(2)}`
}

function Transactions({ transactions }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell />
          <TableCell>Product</TableCell>
          <TableCell>Price (USD)</TableCell>
          <TableCell>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {transactions.map(transaction => (
          <TransactionItem key={transaction.id} transaction={transaction} />
        ))}
      </TableBody>
    </Table>
  )
}

function TransactionItem({ transaction }) {
  const [asset, setAsset] = useState(null)

  useEffect(() => {
    async function main() {
      const assetDoc = await transaction.product.asset.get()
      setAsset(assetDoc.data())
    }

    main()
  }, [])

  return (
    <TableRow>
      <TableCell>
        <FormattedDate date={transaction.createdAt} />
      </TableCell>
      <TableCell>
        <Link
          to={routes.viewTransactionWithVar.replace(
            ':transactionId',
            transaction.id
          )}>
          {' '}
          View Transaction
        </Link>
      </TableCell>
      <TableCell>
        <Link
          to={routes.viewProductWithVar.replace(
            ':productId',
            transaction.product.id
          )}>
          {' '}
          {asset ? asset.title : '...'}
        </Link>
      </TableCell>
      <TableCell>
        <Price price={transaction.priceUsd} />
      </TableCell>
      <TableCell>{transaction.status}</TableCell>
    </TableRow>
  )
}

export default () => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Transactions,
    [
      [
        TransactionFieldNames.customer,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ],
    {
      [options.populateRefs]: true
    }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading your transactions..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load your transactions</ErrorMessage>
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <Transactions transactions={results} />
}
