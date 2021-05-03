import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import categoryMeta from '../../category-meta'
import {
  assetSortFields,
  assetOptions,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'
import { trackAction } from '../../analytics'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SortDropdown from '../../components/sort-dropdown'
import NoResultsMessage from '../../components/no-results-message'
import ErrorMessage from '../../components/error-message'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  OrderDirections,
  AssetFieldNames,
  UserFieldNames,
  mapDates,
  AssetCategories
} from '../../hooks/useDatabaseQuery'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import { mediaQueryForMobiles } from '../../media-queries'

import AvatarTutorialSection from './components/avatar-tutorial-section'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  groupAvatarsBySpeciesBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    [mediaQueryForMobiles]: {
      position: 'relative',
      margin: '0.5rem 0'
    }
  },
  headingWrapper: {
    position: 'relative'
  },
  scrollToTopBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    cursor: 'pointer'
  },
  jumpToSpeciesBtn: {
    textAlign: 'center',
    paddingTop: '0.5rem'
  }
})

const analyticsActionCategory = 'AssetsList'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

function convertAssetsInCacheToAssetToRender(assetsInCache) {
  return assetsInCache.map(asset => ({
    id: asset.asset.id,
    ...mapDates(asset),
    [AssetFieldNames.isApproved]: true
  }))
}

function Assets({
  categoryName,
  sortByFieldName = null,
  sortByDirection = null
}) {
  const [, , user] = useUserRecord()

  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.ViewCache,
    `category-${categoryName}`
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || !result) {
    return <ErrorMessage>Failed to retrieve assets</ErrorMessage>
  }

  if (result && !result.assets.length) {
    return <NoResultsMessage />
  }

  const showNsfwContent =
    user && user[UserFieldNames.enabledAdultContent] ? true : false
  let assets = [...result.assets]

  assets = convertAssetsInCacheToAssetToRender(assets)

  if (!showNsfwContent) {
    assets = assets.filter(asset => asset[AssetFieldNames.isAdult] !== true)
  }

  if (sortByFieldName && sortByDirection) {
    console.debug(`sort by ${sortByFieldName} ${sortByDirection}`)

    assets = assets.sort((assetA, assetB) => {
      switch (sortByFieldName) {
        case assetSortFields.title:
          if (sortByDirection === OrderDirections.ASC) {
            return assetA[AssetFieldNames.title].localeCompare(
              assetB[AssetFieldNames.title]
            )
          } else {
            return assetB[AssetFieldNames.title].localeCompare(
              assetA[AssetFieldNames.title]
            )
          }

        case assetSortFields.createdAt:
          if (sortByDirection === OrderDirections.ASC) {
            return (
              assetB[AssetFieldNames.createdAt] -
              assetA[AssetFieldNames.createdAt]
            )
          } else {
            return (
              assetA[AssetFieldNames.createdAt] -
              assetB[AssetFieldNames.createdAt]
            )
          }

        default:
          throw new Error(
            `Cannot sort assets by unknown field: ${sortByFieldName}`
          )
      }
    })
  }

  return <AssetResults assets={assets} />
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
  const classes = useStyles()

  const onNewSortFieldAndDirection = (fieldName, direction) => {
    setActiveSortFieldName(fieldName)
    setActiveSortDirection(direction)
    trackAction(analyticsActionCategory, 'Click sort by field and direction', {
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

      <div className={classes.root}>
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
          onOpenDropdown={() =>
            trackAction(analyticsActionCategory, 'Open sort dropdown', {
              categoryName
            })
          }
        />
        {categoryName === AssetCategories.tutorial && <AvatarTutorialSection />}
        <Assets
          categoryName={categoryName}
          sortByFieldName={activeSortFieldName || assetsSortByFieldName}
          sortByDirection={activeSortDirection || assetsSortByDirection}
        />
      </div>
    </>
  )
}
