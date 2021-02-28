import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  options
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import ProductResults from '../../components/product-results'

export default () => {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Products,
    undefined,
    { [options.populateRefs]: true }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading products..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load products</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No products found</NoResultsMessage>
  }

  return <ProductResults products={results} />
}
