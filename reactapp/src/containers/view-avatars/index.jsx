import React, { useState, useEffect, Fragment, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
// import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
// import CheckBoxIcon from '@material-ui/icons/CheckBox'
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
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  specialCollectionIds,
  CollectionNames,
  OrderDirections,
  AssetFieldNames,
  AssetCategories,
  SpeciesFieldNames,
  AvatarListFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import { mediaQueryForMobiles } from '../../media-queries'
import { scrollTo, scrollToTop, scrollToElement } from '../../utils'
import SpeciesVsSelector from '../../components/species-vs-selector'

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

let avatarsScrollPosition
const otherSpeciesKey = 'other-species'

function Assets() {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Summaries,
    specialCollectionIds.avatarList
  )
  const [isSpeciesSelectorOpen, setIsSpeciesSelectorOpen] = useState(false)
  const classes = useStyles()
  const headingElementsBySpeciesIdRef = useRef({})

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

  if (isLoading || !result) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get avatars</ErrorMessage>
  }

  const {
    [AvatarListFieldNames.avatars]: avatars,
    [AvatarListFieldNames.species]: species = []
  } = result

  const assets = avatars
    .filter(avatar => {
      if (avatar[AssetFieldNames.isAdult]) {
        if (user && user[UserFieldNames.enabledAdultContent]) {
          return true
        } else {
          return false
        }
      }
      return true
    })
    .map(avatar => ({
      ...avatar,
      // need these to render properly
      id: avatar.asset.id,
      [AssetFieldNames.isApproved]: true
    }))

  if (!assets.length) {
    return <NoResultsMessage />
  }

  const speciesMetaById = {
    [otherSpeciesKey]: {
      [SpeciesFieldNames.pluralName]: 'Other Species',
      [SpeciesFieldNames.singularName]: 'Other Species',
      [SpeciesFieldNames.description]: 'Assets that do not have a species.',
      [SpeciesFieldNames.shortDescription]: 'Assets that do not have a species.'
    },
    ...species.reduce(
      (newSpeciesObj, speciesItem) => ({
        ...newSpeciesObj,
        [speciesItem.id]: speciesItem
      }),
      {}
    )
  }

  const assetsBySpecies = assets.reduce((result, asset) => {
    let keyToUse

    if (
      asset[AssetFieldNames.species] &&
      asset[AssetFieldNames.species].length
    ) {
      keyToUse = asset[AssetFieldNames.species][0].id
    } else {
      keyToUse = otherSpeciesKey
    }

    return {
      ...result,
      [keyToUse]:
        keyToUse in result ? result[keyToUse].concat([asset]) : [asset]
    }
  }, {})

  const scrollToSpeciesId = speciesId => {
    // this could happen if species has no assets in it
    // TODO: purge from species selector if none?
    if (!(speciesId in headingElementsBySpeciesIdRef.current)) {
      return
    }

    scrollToElement(headingElementsBySpeciesIdRef.current[speciesId])
  }

  return (
    <>
      {species && species.length && (
        <>
          {isSpeciesSelectorOpen ? (
            <>
              <Heading variant="h2">Jump To Species</Heading>
              <SpeciesVsSelector
                species={species}
                onSpeciesClick={scrollToSpeciesId}
              />
            </>
          ) : (
            <div className={classes.jumpToSpeciesBtn}>
              <Button
                onClick={() => {
                  trackAction(
                    analyticsActionCategory,
                    'Click jump to species button'
                  )
                  setIsSpeciesSelectorOpen(true)
                }}>
                Jump To Species...
              </Button>
            </div>
          )}
        </>
      )}

      {Object.entries(assetsBySpecies)
        .sort(([idA], [idB]) =>
          speciesMetaById[idA][SpeciesFieldNames.singularName].localeCompare(
            speciesMetaById[idB][SpeciesFieldNames.singularName]
          )
        )
        .map(([speciesId, assetsForSpecies]) => (
          <Fragment key={speciesId}>
            <div className={classes.headingWrapper}>
              <Heading
                variant="h2"
                ref={element => {
                  headingElementsBySpeciesIdRef.current[speciesId] = element
                }}>
                <Link
                  to={routes.viewSpeciesWithVar.replace(
                    ':speciesIdOrSlug',
                    speciesId
                  )}>
                  {speciesMetaById[speciesId][SpeciesFieldNames.singularName]}
                </Link>
              </Heading>
              <span
                className={classes.scrollToTopBtn}
                onClick={() => {
                  trackAction(
                    analyticsActionCategory,
                    'Click species scroll to top',
                    speciesId
                  )
                  scrollToTop()
                }}>
                Top
              </span>
            </div>
            <BodyText>
              {speciesMetaById[speciesId][SpeciesFieldNames.shortDescription]}
            </BodyText>

            <AssetResults assets={assetsForSpecies} showPinned />
          </Fragment>
        ))}
    </>
  )
}

const categoryName = AssetCategories.avatar

export default () => {
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
  // const [groupAvatarsBySpecies, setGroupAvatarsBySpecies] = useState(true)
  const groupAvatarsBySpecies = true // temporarily disabled

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

        {/* <Button
          className={classes.groupAvatarsBySpeciesBtn}
          onClick={() => {
            const newVal = !groupAvatarsBySpecies
            setGroupAvatarsBySpecies(newVal)
            trackAction(
              analyticsActionCategory,
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
        </Button> */}

        {groupAvatarsBySpecies ? (
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
                trackAction(analyticsActionCategory, 'Open sort dropdown', {
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
    </>
  )
}
