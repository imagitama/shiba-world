import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import { Helmet } from 'react-helmet'

import useDatabaseQuery, {
  CollectionNames,
  options,
  mapDates,
  ProductFieldNames,
  TransactionFieldNames,
  Operators,
  OrderDirections,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import AssetResultsItem from '../../components/asset-results-item'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Price from '../../components/price'
import Markdown from '../../components/markdown'
import TransactionsList from '../../components/transactions-list'

import * as routes from '../../routes'
import { canEditProduct } from '../../permissions'
import { createRef, getOpenGraphUrlForRouteUrl } from '../../utils'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  cols: {
    display: 'flex'
  },
  col: {
    width: '49%',
    '&:first-child': {
      marginRight: '2%'
    }
  },
  asset: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0
  },
  priceHeading: {
    margin: 0
  }
})

function TransactionsForProduct({ productId }) {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Transactions,
    [
      [
        TransactionFieldNames.product,
        Operators.EQUALS,
        createRef(CollectionNames.Products, productId)
      ]
    ],
    {
      [options.populateRefs]: true,
      [options.orderBy]: [TransactionFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading transactions..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load transactions</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <TransactionsList transactions={results} forProduct />
}

export default ({
  match: {
    params: { productId }
  }
}) => {
  const [, , user] = useUserRecord()
  const [isLoading, isError, product] = useDatabaseQuery(
    CollectionNames.Products,
    productId,
    { [options.populateRefs]: true }
  )
  const classes = useStyles()

  if (isLoading || !product) {
    return <LoadingIndicator message="Loading product..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load product</ErrorMessage>
  }

  const {
    asset,
    [ProductFieldNames.title]: title,
    [ProductFieldNames.description]: description,
    priceUsd,
    isSaleable,
    isDeleted,
    isApproved
  } = product

  const actualTitle = title || asset[AssetFieldNames.title]

  if (!isApproved) {
    return <ErrorMessage>Not approved yet</ErrorMessage>
  }

  if (isDeleted) {
    return <ErrorMessage>Is deleted</ErrorMessage>
  }

  if (!isSaleable) {
    return <ErrorMessage>Not available for sale</ErrorMessage>
  }

  const hasPermissionToEdit = canEditProduct(user)

  return (
    <div className={classes.root}>
      <Helmet>
        <title>{`${actualTitle} | View product | VRCArena`}</title>
        <meta name="description" content={`View the product ${actualTitle}`} />
        <meta property="og:title" content={actualTitle} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content={`View the title {actualTitle}`}
        />
        <meta
          property="og:url"
          content={getOpenGraphUrlForRouteUrl(
            routes.viewProductWithVar.replace(':productId', productId)
          )}
        />
        <meta property="og:site_name" content="VRCArena" />
      </Helmet>
      <div className={classes.cols}>
        <div className={classes.col}>
          <div className={classes.asset}>
            <AssetResultsItem asset={mapDates(asset)} />
          </div>
        </div>
        <div className={classes.col}>
          <Heading variant="h1">{asset.title}</Heading>
          <Heading variant="h2" className={classes.priceHeading}>
            <Price price={priceUsd} />
          </Heading>
          {description && <Markdown source={description} />}
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <Button
              url={routes.createTransactionWithVar.replace(
                ':productId',
                productId
              )}
              size="large">
              Purchase Now
            </Button>
          </div>
        </div>
      </div>
      {hasPermissionToEdit && (
        <div className={classes.controls}>
          <Button
            url={routes.editProductWithVar.replace(':productId', productId)}>
            Edit
          </Button>
        </div>
      )}
      {hasPermissionToEdit && (
        <LazyLoad>
          <TransactionsForProduct productId={productId} />
        </LazyLoad>
      )}
    </div>
  )
}
