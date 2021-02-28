import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  TransactionFieldNames,
  options,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import NoPermissionMessage from '../../components/no-permission-message'
import TransactionsList from '../../components/transactions-list'

import { canEditProduct } from '../../permissions'

export default () => {
  const [, , user] = useUserRecord()

  const isAllowedToView = canEditProduct(user)

  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Transactions,
    isAllowedToView ? undefined : false,
    {
      [options.populateRefs]: true,
      [options.orderBy]: [TransactionFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (!isAllowedToView) {
    return <NoPermissionMessage />
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading transactions..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load transactions</ErrorMessage>
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <TransactionsList transactions={results} />
}
