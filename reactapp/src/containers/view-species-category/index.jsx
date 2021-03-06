import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

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
import SortDropdown from '../../components/sort-dropdown'
import Button from '../../components/button'
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
import { createRef } from '../../utils'

const useStyles = makeStyles({
  viewAllInCategoryBtn: {
    textAlign: 'center',
    margin: '1rem 0'
  }
})

function Assets({
  species,
  speciesId,
  categoryName,
  sortByFieldName,
  sortByDirection
}) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [
      AssetFieldNames.species,
      Operators.ARRAY_CONTAINS,
      createRef(CollectionNames.Species, speciesId)
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

  if (!results || !results.length) {
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

const analyticsCategory = 'ViewSpeciesCategory'

export default ({
  match: {
    params: { speciesIdOrSlug, categoryName }
  }
}) => {
  let speciesId = isRouteVarAFirebaseId(speciesIdOrSlug)
    ? speciesIdOrSlug
    : null

  let [isLoading, isError, species] = useDatabaseQuery(
    CollectionNames.Species,
    speciesId
      ? speciesId
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
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError || !species) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  species = Array.isArray(species) ? species[0] : species

  // if a slug has finished
  if (!speciesId && species && species.id) {
    speciesId = species.id
  }

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
    trackAction(analyticsCategory, 'Click sort by field and direction', {
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
            speciesIdOrSlug
          )}>
          {species[SpeciesFieldNames.singularName]}
        </Link>
      </Heading>
      <Heading variant="h2">
        <Link
          to={routes.viewSpeciesCategoryWithVar
            .replace(':speciesIdOrSlug', speciesIdOrSlug)
            .replace(':categoryName', categoryName)}>
          {category.name}
        </Link>
      </Heading>
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
          trackAction(analyticsCategory, 'Open sort dropdown', {
            species: species.id,
            categoryName
          })
        }
      />
      <Assets
        species={species}
        speciesId={speciesId}
        categoryName={categoryName}
        sortByFieldName={activeSortFieldName || assetsSortByFieldName}
        sortByDirection={activeSortDirection || assetsSortByDirection}
      />
      <div className={classes.viewAllInCategoryBtn}>
        <Button
          url={routes.viewCategoryWithVar.replace(
            ':categoryName',
            categoryName
          )}
          onClick={() =>
            trackAction(
              analyticsCategory,
              'Click view all in category',
              categoryName
            )
          }>
          View all in category "{category.name}"
        </Button>
      </div>
    </>
  )
}
