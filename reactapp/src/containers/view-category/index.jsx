import React, { useState } from 'react'
import { Helmet } from 'react-helmet'

import categoryMeta from '../../category-meta'
import {
  assetSortFields,
  assetOptions,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SortDropdown from '../../components/sort-dropdown'
import AllTagsBrowser from '../../components/all-tags-browser'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  OrderDirections,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

function Assets({ categoryName, sortByFieldName, sortByDirection }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
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
    return <LoadingIndicator />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to get assets by category {categoryName}
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return 'No results'
  }

  return <AssetResults assets={results} />
}

export default ({
  match: {
    params: { categoryName }
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

  return (
    <>
      <Helmet>
        <title>
          {getDisplayNameByCategoryName(categoryName)} |{' '}
          {getDescriptionByCategoryName(categoryName)} | VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionByCategoryName(categoryName)}
        />
      </Helmet>
      <Heading variant="h1">
        {getDisplayNameByCategoryName(categoryName)}
      </Heading>
      <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
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
        categoryName={categoryName}
        sortByFieldName={activeSortFieldName || assetsSortByFieldName}
        sortByDirection={activeSortDirection || assetsSortByDirection}
      />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
