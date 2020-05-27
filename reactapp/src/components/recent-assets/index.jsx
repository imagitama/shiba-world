import React from 'react'
import { Link } from 'react-router-dom'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  AssetCategories,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../loading-indicator'
import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'
import Button from '../button'
import * as routes from '../../routes'

export default ({ speciesName, limit = 10, categoryName }) => {
  let whereClauses = [
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isApproved, Operators.EQUALS, true]
  ]

  if (speciesName) {
    whereClauses.push([
      AssetFieldNames.species,
      Operators.ARRAY_CONTAINS,
      speciesName
    ])
  }

  if (categoryName) {
    whereClauses.push([
      AssetFieldNames.category,
      Operators.EQUALS,
      categoryName
    ])
  }

  // Do not include nsfw filter as we need another firestore index
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses,
    limit,
    [AssetFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get recent assets</ErrorMessage>
  }

  if (!results.length) {
    return 'No results'
  }

  return (
    <>
      <AssetResults assets={results} />
      {speciesName && categoryName ? (
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', categoryName)}>
          <Button>View More</Button>
        </Link>
      ) : (
        'Click a species above to find more'
      )}
    </>
  )
}
