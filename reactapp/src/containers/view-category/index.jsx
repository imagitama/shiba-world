import React, { useState, useEffect, Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'

import categoryMeta from '../../category-meta'
import {
  assetSortFields,
  assetOptions,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'
import { trackAction } from '../../analytics'
import * as routes from '../../routes'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import SortDropdown from '../../components/sort-dropdown'
import AllTagsBrowser from '../../components/all-tags-browser'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  OrderDirections,
  AssetFieldNames,
  AssetCategories,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import { mediaQueryForMobiles } from '../../media-queries'
import { scrollTo } from '../../utils'

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
  }
})

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

let avatarsScrollPosition
const otherSpeciesKey = 'other-species'

function AvatarAssetResults({ assets }) {
  // Because the avatars page is very long and the most popular page of the site
  // track the user's scroll so they can click on avatars and return and not have
  // to scroll again
  useEffect(() => {
    if (avatarsScrollPosition) {
      scrollTo(avatarsScrollPosition)
      avatarsScrollPosition = null
    }

    const onScroll = () => {
      avatarsScrollPosition = window.scrollY
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const speciesMetaById = {
    [otherSpeciesKey]: {
      [SpeciesFieldNames.pluralName]: 'Other Species',
      [SpeciesFieldNames.singularName]: 'Other Species',
      [SpeciesFieldNames.description]: 'Assets that do not have a species.',
      [SpeciesFieldNames.shortDescription]: 'Assets that do not have a species.'
    }
  }

  const assetsBySpecies = assets.reduce((obj, asset) => {
    if (
      asset[AssetFieldNames.species] &&
      asset[AssetFieldNames.species].length
    ) {
      const speciesItem = asset[AssetFieldNames.species][0]

      speciesMetaById[speciesItem.singularName] = speciesItem

      console.log(speciesItem)
      const key = speciesItem[SpeciesFieldNames.singularName]

      return {
        ...obj,
        [key]: obj[key] ? obj[key].concat([asset]) : [asset]
      }
    } else {
      return {
        ...obj,
        [otherSpeciesKey]: obj[otherSpeciesKey]
          ? obj[otherSpeciesKey].concat([asset])
          : [asset]
      }
    }
  }, {})

  console.log(Object.entries(assetsBySpecies))

  return (
    <>
      {Object.entries(assetsBySpecies)
        .sort(([nameA], [nameB]) => nameA.localeCompare(nameB))
        .map(([speciesNameOrId, assetsForSpecies]) => (
          <Fragment key={speciesNameOrId}>
            <Heading variant="h2">
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesIdOrSlug',
                  speciesNameOrId
                )}>
                {
                  speciesMetaById[speciesNameOrId][
                    SpeciesFieldNames.singularName
                  ]
                }
              </Link>
            </Heading>
            <BodyText>
              {
                speciesMetaById[speciesNameOrId][
                  SpeciesFieldNames.shortDescription
                ]
              }
            </BodyText>

            <AssetResults assets={assetsForSpecies} showPinned />
          </Fragment>
        ))}
    </>
  )
}

function Assets({
  categoryName,
  sortByFieldName = null,
  sortByDirection = null,
  groupAvatarsBySpecies = false
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

  if (groupAvatarsBySpecies && categoryName === AssetCategories.avatar) {
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
  const classes = useStyles()
  const [groupAvatarsBySpecies, setGroupAvatarsBySpecies] = useState(true)

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

      <div className={classes.root}>
        <Heading variant="h1">
          {getDisplayNameByCategoryName(categoryName)}
        </Heading>
        <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>

        {categoryName === AssetCategories.avatar && (
          <Button
            className={classes.groupAvatarsBySpeciesBtn}
            onClick={() => {
              const newVal = !groupAvatarsBySpecies
              setGroupAvatarsBySpecies(newVal)
              trackAction(
                'AssetsList',
                'Click on group avatars by species',
                newVal
              )
            }}
            color={groupAvatarsBySpecies ? 'primary' : 'default'}
            icon={
              groupAvatarsBySpecies ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )
            }>
            Group by species
          </Button>
        )}

        {groupAvatarsBySpecies && categoryName === AssetCategories.avatar ? (
          <Assets categoryName={AssetCategories.avatar} groupAvatarsBySpecies />
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
      </div>
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
