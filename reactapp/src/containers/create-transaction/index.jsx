import React, { useRef, useState, useEffect } from 'react'
import DropIn from 'braintree-web-drop-in-react'

import useDatabaseQuery, {
  CollectionNames,
  options,
  mapDates
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import ProductResultsItem from '../../components/product-results-item'

import * as routes from '../../routes'
import { callFunction } from '../../firebase'

export default ({
  match: {
    params: { productId }
  }
}) => {
  const [isLoading, isError, product] = useDatabaseQuery(
    CollectionNames.Products,
    productId,
    { [options.populateRefs]: true }
  )
  const [token, setToken] = useState(null)
  const [isGettingToken, setIsGettingToken] = useState(false)
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const [transactionId, setTransactionId] = useState(null)
  const [lastError, setLastError] = useState(null)
  const instanceRef = useRef()

  const getToken = async () => {
    try {
      setIsGettingToken(true)
      setLastError(null)

      const {
        data: { token }
      } = await callFunction('getPaymentToken')

      setToken(token)
      setIsGettingToken(false)
      setLastError(null)
    } catch (err) {
      setIsGettingToken(false)
      setLastError(err)
      console.error(err)
    }
  }

  useEffect(() => {
    if (!product) {
      return
    }

    getToken()
  }, [product === null])

  if (isLoading) {
    return <LoadingIndicator message="Getting product for transaction..." />
  }

  if (isGettingToken) {
    return <LoadingIndicator message="Getting token..." />
  }

  if (isCreatingTransaction) {
    return <LoadingIndicator message="Creating transaction..." />
  }

  if (transactionId) {
    return (
      <SuccessMessage>
        Transaction has been created successfully
        <br />
        <br />
        <Button
          url={routes.viewTransactionWithVar.replace(
            ':transactionId',
            transactionId
          )}>
          View Transaction
        </Button>
      </SuccessMessage>
    )
  }

  if (isError) {
    return <ErrorMessage>Failed to get product for transaction</ErrorMessage>
  }

  if (!token) {
    return 'Need token'
  }

  if (!product) {
    return 'Need product'
  }

  // "No payment method is available." means they havent entered a credit card number
  if (lastError && lastError.message !== 'No payment method is available.') {
    return (
      <ErrorMessage>
        Failed to process transaction: {lastError.message}
        <br />
        <br />
        <Button
          onClick={() => {
            setIsCreatingTransaction(false)
            setLastError(null)
          }}>
          Try Again
        </Button>
      </ErrorMessage>
    )
  }

  const { priceUsd } = product

  const onBuyClick = async () => {
    try {
      console.debug('Requesting payment method from braintree...')

      const { nonce } = await instanceRef.current.requestPaymentMethod()

      setIsCreatingTransaction(true)
      setLastError(null)

      console.debug(`Nonce: ${nonce}`)

      const {
        data: { transactionId }
      } = await callFunction('createTransaction', {
        nonce,
        productId,
        priceUsd // pass it so at the last second we can cancel transaction if price changes
      })

      console.debug(`Transaction ID : ${transactionId}`)

      setTransactionId(transactionId)
      setIsCreatingTransaction(false)
      setLastError(null)
    } catch (err) {
      console.error(err)
      setIsCreatingTransaction(false)
      setLastError(err)
    }
  }

  return (
    <div>
      <Heading variant="h1">Create Transaction</Heading>
      <ProductResultsItem product={mapDates(product)} />
      {token ? (
        <>
          <DropIn
            options={{ authorization: token }}
            onInstance={instance => {
              console.log(instance)
              instanceRef.current = instance
            }}
            onError={err => {
              console.error(err)
              setLastError(err)
            }}
          />
          <div style={{ textAlign: 'center', padding: '1rem 0 ' }}>
            <Button onClick={onBuyClick} size="large">
              Buy
            </Button>
          </div>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  )
}
