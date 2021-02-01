import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import {
  assetSortFields,
  assetOptions,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'
import { trackAction } from '../../analytics'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SortDropdown from '../../components/sort-dropdown'
import Button from '../../components/button'
import AllTagsBrowser from '../../components/all-tags-browser'
import NoResultsMessage from '../../components/no-results-message'

import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  OrderDirections,
  SpeciesFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import useCategoryMeta from '../../hooks/useCategoryMeta'

function Assets({ species, categoryName, sortByFieldName, sortByDirection }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [
      AssetFieldNames.species,
      Operators.ARRAY_CONTAINS,
      species[SpeciesFieldNames.singularName]
    ],
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
    {
      [options.orderBy]: [sortByFieldName, sortByDirection],
      [options.queryName]: `view-species-category-${
        species[SpeciesFieldNames.singularName]
      }-${categoryName}`
    }
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to get assets by species{' '}
        {species[SpeciesFieldNames.singularName]} and category {categoryName}
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} showPinned />
}

function isRouteVarAFirebaseId(routeVar) {
  return (
    routeVar &&
    routeVar.length >= 20 &&
    routeVar.match(/^[a-z0-9]+$/i) !== null &&
    !routeVar.includes(' ')
  )
}

export default ({
  match: {
    params: { speciesIdOrSlug, categoryName }
  }
}) => {
  let [isLoading, isError, species] = useDatabaseQuery(
    CollectionNames.Species,
    isRouteVarAFirebaseId(speciesIdOrSlug)
      ? speciesIdOrSlug
      : [[SpeciesFieldNames.slug, Operators.EQUALS, speciesIdOrSlug]],
    {
      [options.queryName]: `view-species-category-${speciesIdOrSlug}-${categoryName}`
    }
  )
  const category = useCategoryMeta(categoryName)
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

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError || !species) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  species = Array.isArray(species) ? species[0] : species

  if (!species) {
    return (
      <ErrorMessage>
        Sorry that species does not seem to exist.
        <br />
        <br />
        <Button url={routes.viewAllSpecies}>View All Species</Button>
      </ErrorMessage>
    )
  }

  if (!category) {
    return (
      <ErrorMessage>
        Sorry that category does not seem to exist.
        <br />
        <br />
        <Button url={routes.viewAllSpecies}>View All Species</Button>
      </ErrorMessage>
    )
  }

  const onNewSortFieldAndDirection = (fieldName, direction) => {
    setActiveSortFieldName(fieldName)
    setActiveSortDirection(direction)
    trackAction('AssetsList', 'Click sort by field and direction', {
      species: species.id,
      categoryName,
      fieldName,
      direction
    })
  }

  const desc = category.shortDescription
  return (
    <>
      <Helmet>
        <title>
          {category.name} - {species[SpeciesFieldNames.singularName]} | {desc} |
          VRCArena
        </title>
        <meta name="description" content={desc} />
      </Helmet>
      <Heading variant="h1">
        <Link
          to={routes.viewSpeciesWithVar.replace(
            ':speciesIdOrSlug',
            species[SpeciesFieldNames.singularName]
          )}>
          {species.name}
        </Link>
      </Heading>
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(
              ':species[SpeciesFieldNames.singularName]',
              species[SpeciesFieldNames.singularName]
            )
            .replace(':categoryName', categoryName)}>
          {category.name}
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
        onOpenDropdown={() =>
          trackAction('AssetsList', 'Open sort dropdown', {
            species: species.id,
            categoryName
          })
        }
      />
      <Assets
        species={species}
        categoryName={categoryName}
        sortByFieldName={activeSortFieldName || assetsSortByFieldName}
        sortByDirection={activeSortDirection || assetsSortByDirection}
      />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
