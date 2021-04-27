import React, { useState, useEffect, Fragment, useRef } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
// import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
// import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'

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
import Message from '../../components/message'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  specialCollectionIds,
  CollectionNames,
  OrderDirections,
  AssetFieldNames,
  AssetCategories,
  SpeciesFieldNames,
  AvatarListFieldNames,
  UserFieldNames,
  mapDates
} from '../../hooks/useDatabaseQuery'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import { mediaQueryForMobiles } from '../../media-queries'
import { scrollTo, scrollToTop, scrollToElement } from '../../utils'
import SpeciesVsSelector from '../../components/species-vs-selector'
import { importantTags } from '../../config'
import NewestAvatar from './components/newest-avatar'

const useStyles = makeStyles({
  root: {
    position: 'relative'
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
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex'
  },
  control: {
    marginLeft: '0.5rem'
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
    label: 'VRChat SDK3',
    tag: 'sdk3'
  },
  // {
  //   label: 'VRChat Ready',
  //   tag: 'vrchat_ready'
  // },
  {
    label: 'NeosVR Ready',
    tag: importantTags.neosvr_compatible
  },
  {
    label: 'ChilloutVR Ready',
    tag: importantTags.chilloutvr_compatible
  },
  {
    label: 'Free',
    tag: importantTags.free
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
  const [isLoadingPage1, isErroredPage1, resultPage1] = useDatabaseQuery(
    CollectionNames.Summaries,
    specialCollectionIds.avatarList
  )
  const [isLoadingPage2, isErroredPage2, resultPage2] = useDatabaseQuery(
    CollectionNames.Summaries,
    specialCollectionIds.avatarList1
  )
  const [isSpeciesSelectorOpen, setIsSpeciesSelectorOpen] = useState(false)
  const classes = useStyles()
  const headingElementsBySpeciesIdRef = useRef({})
  const autoScrollTimeoutRef = useRef()
  const [activeFilters] = useStorage(avatarsFiltersStorageKey, [])
  const [assetsSortByFieldName] = useStorage(storageKeys.assetsSortByFieldName)
  const [assetsSortByDirection] = useStorage(storageKeys.assetsSortByDirection)
  const [activeSortFieldName, setActiveSortFieldName] = useState(
    assetsSortByFieldName || null
  )
  const [activeSortDirection, setActiveSortDirection] = useState(
    assetsSortByDirection || null
  )
  const [hoverOnEffectEnabled, setHoverOnEffectEnabled] = useState(false)
  const onNewSortFieldAndDirection = (fieldName, direction) => {
    setActiveSortFieldName(fieldName)
    setActiveSortDirection(direction)
    trackAction(analyticsActionCategory, 'Click sort by field and direction', {
      categoryName,
      fieldName,
      direction
    })
  }
  const [areFiltersVisible, setAreFiltersVisible] = useState(false)

  const resetSorting = () => {
    setActiveSortDirection(null)
    setActiveSortFieldName(null)
    trackAction(analyticsActionCategory, 'Click reset sorting button')
  }

  // Because the avatars page is very long and the most popular page of the site
  // track the user's scroll so they can click on avatars and return and not have
  // to scroll again
  useEffect(() => {
    if (!resultPage1 || !resultPage2) {
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
  }, [resultPage1 !== null, resultPage2 !== null])

  if (isLoadingPage1 || isLoadingPage2 || !resultPage1 || !resultPage2) {
    return <LoadingIndicator message="Loading avatars..." />
  }

  if (isErroredPage1 || isErroredPage2) {
    return <ErrorMessage>Failed to get avatars</ErrorMessage>
  }

  const species = resultPage1[AvatarListFieldNames.species]

  const avatars = (resultPage1[AvatarListFieldNames.avatars] || []).concat(
    resultPage2[AvatarListFieldNames.avatars] || []
  )

  let assets = avatars
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
    .map(avatar =>
      mapDates({
        ...avatar,
        // need these to render properly
        id: avatar.asset.id,
        [AssetFieldNames.isApproved]: true
      })
    )

  console.debug(
    `found ${avatars.length} avatars (${assets.length} after filter)`
  )

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
    console.debug('scroll to species', speciesId)

    // this could happen if species has no assets in it
    // TODO: purge from species selector if none?
    if (!(speciesId in headingElementsBySpeciesIdRef.current)) {
      console.debug('tried to scroll to species without a heading')
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

  if (activeSortFieldName && activeSortDirection) {
    console.debug(`sort by ${activeSortFieldName} ${activeSortDirection}`)

    assets = assets.sort((assetA, assetB) => {
      switch (activeSortFieldName) {
        case assetSortFields.title:
          if (activeSortDirection === OrderDirections.ASC) {
            return assetA[AssetFieldNames.title].localeCompare(
              assetB[AssetFieldNames.title]
            )
          } else {
            return assetB[AssetFieldNames.title].localeCompare(
              assetA[AssetFieldNames.title]
            )
          }

        case assetSortFields.createdAt:
          if (activeSortDirection === OrderDirections.ASC) {
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
            `Cannot sort assets by unknown field: ${activeSortFieldName}`
          )
      }
    })

    if (activeFilters.length) {
      assets = assets.filter(filterActiveFilters)
    }
  }

  return (
    <>
      {!activeSortFieldName && !activeSortDirection && isSpeciesSelectorOpen && (
        <>
          <Heading variant="h2">Jump To Species</Heading>
          <SpeciesVsSelector
            species={species}
            onSpeciesClick={scrollToSpeciesId}
          />
        </>
      )}

      {areFiltersVisible && <Filters />}

      <div className={classes.controls}>
        <div className={classes.control}>
          <Button
            onClick={() => setAreFiltersVisible(currentVal => !currentVal)}
            icon={
              areFiltersVisible ? (
                <CheckBoxIcon />
              ) : (
                <CheckBoxOutlineBlankIcon />
              )
            }>
            Filters
          </Button>
        </div>
        <div className={classes.control}>
          <SortDropdown
            options={assetOptions}
            label={getLabelForAssetSortFieldNameAndDirection(
              activeSortFieldName,
              activeSortDirection
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
        </div>
        {activeSortFieldName && activeSortDirection && (
          <div className={classes.control}>
            <Button onClick={resetSorting}>Reset</Button>
          </div>
        )}
        {!activeSortFieldName &&
          !activeSortDirection &&
          !isSpeciesSelectorOpen && (
            <div className={classes.control}>
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
      </div>

      {areFiltersVisible && (
        <Message>
          Please note that these filters use tags that are decided by the{' '}
          <strong>community</strong> and might not be 100% accurate
        </Message>
      )}

      {activeSortDirection && activeSortFieldName ? (
        <AssetResults assets={assets} hoverOnEffect={hoverOnEffectEnabled} />
      ) : (
        <>
          {Object.entries(assetsBySpecies)
            .sort(([idA], [idB]) =>
              speciesMetaById[idA][
                SpeciesFieldNames.singularName
              ].localeCompare(
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
                        headingElementsBySpeciesIdRef.current[
                          speciesId
                        ] = element
                      }}>
                      <Link
                        to={routes.viewSpeciesWithVar.replace(
                          ':speciesIdOrSlug',
                          speciesId
                        )}>
                        {
                          speciesMetaById[speciesId][
                            SpeciesFieldNames.singularName
                          ]
                        }
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
                    {
                      speciesMetaById[speciesId][
                        SpeciesFieldNames.shortDescription
                      ]
                    }
                  </BodyText>

                  {assetsToRender.length ? (
                    <AssetResults
                      assets={assetsToRender}
                      showPinned
                      hoverOnEffect={hoverOnEffectEnabled}
                    />
                  ) : (
                    <div className={classes.noResultsMsg}>
                      No assets matching your filter
                    </div>
                  )}
                </Fragment>
              )
            })}
        </>
      )}
    </>
  )
}

const categoryName = AssetCategories.avatar

export default () => {
  const classes = useStyles()

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

        <NewestAvatar />

        <Assets categoryName={AssetCategories.avatar} groupAvatarsBySpecies />
      </div>
    </>
  )
}
