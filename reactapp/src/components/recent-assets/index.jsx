import React from 'react'
import { Link } from 'react-router-dom'

import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import AssetResults from '../asset-results'
import ErrorMessage from '../error-message'
import Button from '../button'
import Heading from '../heading'
import BodyText from '../body-text'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'

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

export default ({
  speciesName = null,
  categoryName = null,
  showPinned,
  limit = 10,
  title = ''
}) => {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
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

  // Some species only have avatars so it looks very empty
  if (!results.length) {
    return null
  }

  return (
    <>
      <Heading variant="h2">
        <Link
          to={
            speciesName
              ? routes.viewSpeciesCategoryWithVar
                  .replace(':speciesName', speciesName)
                  .replace(':categoryName', categoryName)
              : routes.viewCategoryWithVar.replace(
                  ':categoryName',
                  categoryName
                )
          }>
          {title || categoryMeta[categoryName].name}
        </Link>
      </Heading>
      <BodyText>{categoryMeta[categoryName].shortDescription}</BodyText>
      <AssetResults assets={results} showPinned={showPinned} />
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        {speciesName && categoryName && (
          <Link
            to={routes.viewCategoryWithVar.replace(
              ':categoryName',
              categoryName
            )}>
            <Button color="default">View All Species</Button>
          </Link>
        )}{' '}
        {user && (
          <Button color="default" url={routes.createAsset}>
            Upload
          </Button>
        )}{' '}
        <Link to={getViewMoreLinkUrl(speciesName, categoryName)}>
          <Button>View More</Button>
        </Link>
      </div>
    </>
  )
}
