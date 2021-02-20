import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  options,
  mapDates
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AssetResultsItem from '../../components/asset-results-item'
import Heading from '../../components/heading'
import Button from '../../components/button'
import Price from '../../components/price'
import * as routes from '../../routes'

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

  if (isLoading) {
    return <LoadingIndicator message="Loading product..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load product</ErrorMessage>
  }

  if (!product) {
    return null
  }

  const { asset, priceUsd, isSaleable, isDeleted, isApproved } = product

  if (!isApproved) {
    return <ErrorMessage>Not approved yet</ErrorMessage>
  }

  if (isDeleted) {
    return <ErrorMessage>Is deleted</ErrorMessage>
  }

  if (!isSaleable) {
    return <ErrorMessage>Not available for sale</ErrorMessage>
  }

  return (
    <div>
      <Heading variant="h1">{asset.title}</Heading>
      <Heading variant="h2">
        <Price price={priceUsd} />
      </Heading>
      <AssetResultsItem asset={mapDates(asset)} />
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <Button
          url={routes.createTransactionWithVar.replace(':productId', productId)}
          size="large">
          Purchase Now
        </Button>
      </div>
      <Button url={routes.editProductWithVar.replace(':productId', productId)}>
        Edit
      </Button>
    </div>
  )
}
