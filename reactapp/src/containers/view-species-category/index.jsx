import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import speciesMeta from '../../species-meta'
import categoriesMeta from '../../category-meta'
import * as routes from '../../routes'
import {
  assetSortFields,
  assetOptions,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SortDropdown from '../../components/sort-dropdown'

import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'

function getSpeciesByName(speciesName) {
  if (!speciesMeta[speciesName]) {
    throw new Error(`Invalid species name: ${speciesName}`)
  }
  return speciesMeta[speciesName]
}

function getCategoryByName(categoryName) {
  if (!categoriesMeta[categoryName]) {
    throw new Error(
      `Cannot get category by name. It does not exist: ${categoryName}`
    )
  }
  return categoriesMeta[categoryName]
}

function getNameForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).name
}

function getCategoryDisplayName(categoryName) {
  return getCategoryByName(categoryName).name
}

function getShortDescriptionForCategoryName(categoryName) {
  return getCategoryByName(categoryName).shortDescription
}

function Assets({
  speciesName,
  categoryName,
  sortByFieldName,
  sortByDirection
}) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.species, Operators.ARRAY_CONTAINS, speciesName],
    [AssetFieldNames.category, Operators.EQUALS, categoryName],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined,
    undefined,
    [sortByFieldName, sortByDirection]
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to get assets by species {speciesName} and category{' '}
        {categoryName}
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return 'No results'
  }

  return <AssetResults assets={results} showPinned />
}

export default ({
  match: {
    params: { speciesName, categoryName }
  }
}) => {
  const [assetsSortByFieldName] = useStorage(
    storageKeys.assetsSortByFieldName,
    assetSortFields.title
  )
  const [assetsSortByDirection] = useStorage(
    storageKeys.assetsSortByDirection,
    OrderDirections.ASC
  )
  const [activeSortFieldName, setActiveSortFieldName] = useState()
  const [activeSortDirection, setActiveSortDirection] = useState()

  const onNewSortFieldAndDirection = (fieldName, direction) => {
    setActiveSortFieldName(fieldName)
    setActiveSortDirection(direction)
  }

  const desc = getShortDescriptionForCategoryName(categoryName)

  return (
    <>
      <Helmet>
        <title>
          {getCategoryDisplayName(categoryName)} -{' '}
          {getNameForSpeciesName(speciesName)} | {desc} | VRCArena
        </title>
        <meta name="description" content={desc} />
      </Helmet>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(':speciesName', speciesName)}>
          {getNameForSpeciesName(speciesName)}
        </Link>
      </Heading>
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesName', speciesName)
            .replace(':categoryName', categoryName)}>
          {getCategoryDisplayName(categoryName)}
        </Link>
      </Heading>
      <BodyText>{desc}</BodyText>
      <SortDropdown
        options={assetOptions}
        label={getLabelForAssetSortFieldNameAndDirection(
          activeSortFieldName || assetsSortByFieldName,
          activeSortDirection || assetsSortByDirection
        )}
        fieldNameKey={storageKeys.assetsSortByFieldName}
        directionKey={storageKeys.assetsSortByDirection}
        onNewSortFieldAndDirection={onNewSortFieldAndDirection}
      />
      <Assets
        speciesName={speciesName}
        categoryName={categoryName}
        sortByFieldName={activeSortFieldName || assetsSortByFieldName}
        sortByDirection={activeSortDirection || assetsSortByDirection}
      />
    </>
  )
}
