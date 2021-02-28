import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  options
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoResultsMessage from '../../components/no-results-message'
import ProductResults from '../../components/product-results'
import Button from '../../components/button'

import * as routes from '../../routes'
import { canEditProduct } from '../../permissions'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0
  }
})

const Products = () => {
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

export default () => {
  const [, , user] = useUserRecord()
  const classes = useStyles()

  const hasPermissionToEdit = canEditProduct(user)

  return (
    <div className={classes.root}>
      {hasPermissionToEdit && (
        <div className={classes.controls}>
          <Button url={routes.createProduct}>Create</Button>
        </div>
      )}
      <Products />
    </div>
  )
}
