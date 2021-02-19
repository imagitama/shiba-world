import React, { useState, useEffect, Fragment, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
// import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
// import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

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
    position: 'absolute',
    top: 0,
    right: 0
  },
  noResultsMsg: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '1rem',
    opacity: '0.75'
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '0.5rem'
  },
  filter: {
    marginRight: '0.5rem'
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
const avatarsFiltersStorageKey = 'avatar-filters'

const allFilters = [
  {
    label: 'Quest compatible',
    tag: 'quest'
  },
  {
    label: 'Full-body ready',
    tag: 'full_body_ready'
  },
  {
    label: 'Built with SDK3',
    tag: 'sdk3'
  },
  // {
  //   label: 'Built with SDK2',
  //   tag: 'sdk2'
  // },
  {
    label: 'Includes Blend file',
    tag: 'blendfile_included'
  }
]

function Filter({ label, isEnabled, onClick }) {
  const classes = useStyles()
  return (
    <div className={classes.filter}>
      <FormControlLabel
        control={<Switch size="small" checked={isEnabled} onChange={onClick} />}
        label={label}
      />
    </div>
  )
}

function Filters() {
  const classes = useStyles()
  const [activeFilters, storeActiveFilters] = useStorage(
    avatarsFiltersStorageKey,
    []
  )

  return (
    <>
      <Heading variant="h2">Filters</Heading>
      <div className={classes.filters}>
        {allFilters.map(({ label, tag }) => (
          <Filter
            key={tag}
            label={label}
            isEnabled={activeFilters.includes(tag)}
            onClick={() => {
              const isActive = activeFilters.includes(tag)
              const newActiveFilters = isActive
                ? activeFilters.filter(item => item !== tag)
                : activeFilters.concat([tag])
              storeActiveFilters(newActiveFilters)
              trackAction(
                analyticsActionCategory,
                isActive ? 'Disable tag filter' : 'Enable tag filter',
                tag
              )
            }}
          />
        ))}
      </div>
    </>
  )
}

function Assets() {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Summaries,
    specialCollectionIds.avatarList
  )
  const [isSpeciesSelectorOpen, setIsSpeciesSelectorOpen] = useState(false)
  const classes = useStyles()
  const headingElementsBySpeciesIdRef = useRef({})
  const autoScrollTimeoutRef = useRef()
  const [activeFilters] = useStorage(avatarsFiltersStorageKey, [])

  // Because the avatars page is very long and the most popular page of the site
  // track the user's scroll so they can click on avatars and return and not have
  // to scroll again
  useEffect(() => {
    if (!result) {
      return
    }

    if (avatarsScrollPosition) {
      // it takes so long to render the avatar list that we need to compensate with a delay
      // todo: do not render all items and instead lazy load them?
      autoScrollTimeoutRef.current = setTimeout(() => {
        scrollTo(avatarsScrollPosition, false)
        avatarsScrollPosition = null
      }, 100)
    }

    const onScroll = () => {
      avatarsScrollPosition = window.scrollY
    }

    window.addEventListener('scroll', onScroll)

    return () => {
      clearTimeout(autoScrollTimeoutRef.current)
      window.removeEventListener('scroll', onScroll)
    }
  }, [result !== null])

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

  const filterActiveFilters = asset => {
    for (const activeFilterTag of activeFilters) {
      if (!asset[AssetFieldNames.tags].includes(activeFilterTag)) {
        return false
      }
    }
    return true
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

      <Filters />

      {Object.entries(assetsBySpecies)
        .sort(([idA], [idB]) =>
          speciesMetaById[idA][SpeciesFieldNames.singularName].localeCompare(
            speciesMetaById[idB][SpeciesFieldNames.singularName]
          )
        )
        .map(([speciesId, assetsForSpecies]) => {
          const assetsToRender = activeFilters.length
            ? assetsForSpecies.filter(filterActiveFilters)
            : assetsForSpecies

          return (
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

              {assetsToRender.length ? (
                <AssetResults assets={assetsToRender} showPinned />
              ) : (
                <div className={classes.noResultsMsg}>
                  No assets matching your filter
                </div>
              )}
            </Fragment>
          )
        })}
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
