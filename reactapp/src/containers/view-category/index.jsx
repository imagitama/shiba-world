import React, { useState, Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import categoryMeta from '../../category-meta'
import {
  assetSortFields,
  assetOptions,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'
import { trackAction } from '../../analytics'
import speciesMeta, { speciesName } from '../../species-meta'
import * as routes from '../../routes'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SortDropdown from '../../components/sort-dropdown'
import AllTagsBrowser from '../../components/all-tags-browser'
import NoResultsMessage from '../../components/no-results-message'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  OrderDirections,
  AssetFieldNames,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

function AvatarAssetResults({ assets }) {
  let otherSpecies = [[speciesName.otherSpecies, []]]

  const assetsBySpecies = assets.reduce((obj, asset) => {
    if (
      asset[AssetFieldNames.species] &&
      asset[AssetFieldNames.species].length &&
      asset[AssetFieldNames.species][0] !== speciesName.otherSpecies
    ) {
      const key = asset[AssetFieldNames.species][0]

      return {
        ...obj,
        [key]: obj[key] ? obj[key].concat([asset]) : [asset]
      }
    } else {
      // Quick and dirty way to ensure Other Species comes last
      otherSpecies[0][1].push(asset)
      return obj
    }
  }, {})

  return (
    <>
      {Object.entries(assetsBySpecies)
        .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
        .concat(otherSpecies)
        .map(([speciesName, assetsForSpecies]) => (
          <Fragment key={speciesName}>
            <Heading variant="h2">
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesName',
                  speciesName
                )}>
                {speciesMeta[speciesName].name}
              </Link>
            </Heading>
            <BodyText>{speciesMeta[speciesName].shortDescription}</BodyText>

            <AssetResults assets={assetsForSpecies} showPinned />
          </Fragment>
        ))}
    </>
  )
}

function Assets({
  categoryName,
  sortByFieldName = null,
  sortByDirection = null
}) {
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
    sortByFieldName && sortByDirection
      ? [sortByFieldName, sortByDirection]
      : undefined
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
    return <NoResultsMessage />
  }

  if (categoryName === AssetCategories.avatar) {
    return <AvatarAssetResults assets={results} />
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
    trackAction('AssetsList', 'Click sort by field and direction', {
      categoryName,
      fieldName,
      direction
    })
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

      {categoryName === AssetCategories.avatar ? (
        <Assets categoryName={AssetCategories.avatar} />
      ) : (
        <>
          <SortDropdown
            options={assetOptions}
            label={getLabelForAssetSortFieldNameAndDirection(
              activeSortFieldName || assetsSortByFieldName,
              activeSortDirection || assetsSortByDirection
            )}
            fieldNameKey={storageKeys.assetsSortByFieldName}
            directionKey={storageKeys.assetsSortByDirection}
            onNewSortFieldAndDirection={onNewSortFieldAndDirection}
            onOpenDropdown={() =>
              trackAction('AssetsList', 'Open sort dropdown', {
                categoryName
              })
            }
          />
          <Assets
            categoryName={categoryName}
            sortByFieldName={activeSortFieldName || assetsSortByFieldName}
            sortByDirection={activeSortDirection || assetsSortByDirection}
          />
        </>
      )}
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
