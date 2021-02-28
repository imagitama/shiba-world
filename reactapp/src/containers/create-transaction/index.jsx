import React, { useRef, useState, useEffect } from 'react'
import DropIn from 'braintree-web-drop-in-react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  options,
  // mapDates,
  ProductFieldNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import SuccessMessage from '../../components/success-message'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Price from '../../components/price'
import Message from '../../components/message'

import * as routes from '../../routes'
import { callFunction } from '../../firebase'
import { Link } from 'react-router-dom'

const useStyles = makeStyles({
  braintreeClient: {
    backgroundColor: '#FFF',
    padding: '1rem',
    marginTop: '2rem'
  },
  priceHeading: { margin: 0 },
  buyButtonWrapper: { textAlign: 'center', padding: '1rem 0 ' }
})

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
  const classes = useStyles()

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

  if (isGettingToken || !token) {
    return <LoadingIndicator message="Setting up transaction..." />
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

  const {
    [ProductFieldNames.priceUsd]: priceUsd,
    [ProductFieldNames.asset]: asset,
    [ProductFieldNames.title]: title
  } = product

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
      <Heading variant="h1">
        Purchase "{title || asset[AssetFieldNames.title]}"
      </Heading>
      <Heading variant="h2" className={classes.priceHeading}>
        <Price price={priceUsd} />
      </Heading>
      {token ? (
        <>
          <div className={classes.braintreeClient}>
            <DropIn
              options={{
                authorization: token,
                paypal: {
                  flow: 'checkout',
                  amount: priceUsd,
                  currency: 'USD'
                }
              }}
              onInstance={instance => {
                instanceRef.current = instance
              }}
              onError={err => {
                console.error(err)
                setLastError(err)
              }}
            />
            <div className={classes.buyButtonWrapper}>
              <Button onClick={onBuyClick} size="large">
                Buy
              </Button>
            </div>
          </div>
          <br />
          <Message>
            All payments are securely processed by{' '}
            <a
              href="https://www.braintreepayments.com/au"
              rel="noopener noreferrer">
              Braintree
            </a>{' '}
            - a very popular payment processor owned by{' '}
            <a href="https://paypal.com/" rel="noopener noreferrer">
              PayPal
            </a>
            .
          </Message>
          <Message>
            How we store your payment information is explained in our{' '}
            <Link to={routes.privacyPolicy}>privacy policy</Link>.
          </Message>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </div>
  )
}
