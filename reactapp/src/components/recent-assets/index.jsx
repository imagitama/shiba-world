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

function getViewMoreLinkUrl(speciesName, categoryName) {
  if (speciesName && categoryName) {
    return routes.viewSpeciesCategoryWithVar
      .replace(':speciesName', speciesName)
      .replace(':categoryName', categoryName)
  }
  if (categoryName) {
    return routes.viewCategoryWithVar.replace(':categoryName', categoryName)
  }
  throw new Error('Cannot get view more link url: no category name!')
}

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
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <Link to={getViewMoreLinkUrl(speciesName, categoryName)}>
          <Button>View More</Button>
        </Link>
      </div>
    </>
  )
}
