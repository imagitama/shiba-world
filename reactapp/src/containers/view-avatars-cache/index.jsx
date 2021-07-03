import React, { useState, createContext, useContext } from 'react'
import { useParams, useHistory } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import CategoryIcon from '@material-ui/icons/Category'
import TodayIcon from '@material-ui/icons/Today'

import * as routes from '../../routes'
import useStorage, { keys as storageKeys } from '../../hooks/useStorage'
import useDatabaseQuery, {
  AssetCategories,
  AssetFieldNames,
  mapDates,
  OrderDirections,
  SpeciesFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import PagesNavigation from '../../components/pages-navigation'
import SpeciesVsSelector from '../../components/species-vs-selector'
import Heading from '../../components/heading'
import AssetResults from '../../components/asset-results'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'
import SortDropdown from '../../components/sort-dropdown'

import Filters from './components/filters'
import {
  assetOptions,
  assetSortFields,
  getLabelForAssetSortFieldNameAndDirection
} from '../../sorting'
import { trackAction } from '../../analytics'
import useUserRecord from '../../hooks/useUserRecord'

const useStyles = makeStyles({
  species: {
    position: 'relative'
  },
  unexpanded: {
    height: '100px',
    overflow: 'hidden'
  },
  overlay: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    background: 'linear-gradient(rgba(0, 0, 0, 0) 0%, #282828 100%)',
    cursor: 'pointer',
    '& span': {
      textShadow: '1px 1px 1px #000',
      position: 'absolute',
      top: '50%',
      left: '0',
      width: '100%',
      textAlign: 'center',
      fontWeight: 'bold'
    }
  },
  page: {
    position: 'relative'
  },
  controls: {
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex'
  },
  control: {
    marginLeft: '0.25rem'
  },
  moreAvatarsOnNextPageMessage: {
    textAlign: 'center',
    textShadow: '1px 1px 1px #000',
    fontWeight: 'bold',
    padding: '1rem 0'
  }
})

const AvatarPageContext = createContext({ currentPageNumber: null })
const useAvatarPage = () => useContext(AvatarPageContext)

const getUrlForPageNumber = pageNumber =>
  routes.viewAvatarsWithPageVar.replace(':pageNumber', pageNumber)

const getPageNumberForSpeciesId = (species, speciesId) => {
  const match = species.find(({ id }) => id === speciesId)
  return match.pageNumber
}

function Species() {
  const { species, currentPageNumber } = useAvatarPage()
  const { push } = useHistory()
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = useStyles()

  const onSpeciesClickWithId = speciesId => {
    const pageNumber = getPageNumberForSpeciesId(species, speciesId)

    setIsExpanded(false)
    push(getUrlForPageNumber(pageNumber))
  }

  const selectedSpeciesIds = species
    .filter(item => parseInt(item.pageNumber) === currentPageNumber)
    .map(({ id }) => id)

  return (
    <div
      className={`${classes.species} ${isExpanded ? '' : classes.unexpanded}`}>
      <SpeciesVsSelector
        species={species}
        onSpeciesClick={onSpeciesClickWithId}
        selectedSpeciesIds={selectedSpeciesIds}
        showUnselected
      />
      {!isExpanded && (
        <div className={classes.overlay} onClick={() => setIsExpanded(true)}>
          <span>Click to navigate to species</span>
        </div>
      )}
    </div>
  )
}

function Avatars({ avatars }) {
  const [activeFilters] = useStorage(avatarsFiltersStorageKey, [])

  const selectedAssetIds = avatars
    .filter(asset => {
      for (const tag of activeFilters) {
        const tags = asset[AssetFieldNames.tags] || [] // could be empty
        if (tags.includes(tag)) {
          return true
        }
      }
      return false
    })
    .map(({ id }) => id)

  return (
    <AssetResults
      assets={avatars.map(mapDates)}
      selectedAssetIds={selectedAssetIds}
      showUnselected={activeFilters.length}
    />
  )
}

const avatarsFiltersStorageKey = 'avatar-filters'

function MoreAvatarsOnNextPage({ remainingCount }) {
  const classes = useStyles()
  return (
    <div className={classes.moreAvatarsOnNextPageMessage}>
      There are {remainingCount} avatars on the next page for this species
    </div>
  )
}

const unknownSpecies = {
  id: 'unknown',
  [SpeciesFieldNames.pluralName]: 'Unknown'
}

function Page() {
  const { currentPageNumber, species, viewCacheName, sortBy } = useAvatarPage()
  const [isLoading, isError, page] = useDatabaseQuery(
    'viewCache',
    `${viewCacheName}_page${currentPageNumber}`
  )

  const { items } = page || { items: {} }

  if (isLoading) {
    return <LoadingIndicator message="Loading avatars..." />
  }

  if (isError) {
    return (
      <ErrorMessage>
        Failed to load avatars (code {isError ? '201' : '202'})
      </ErrorMessage>
    )
  }

  if (!page || !items.length) {
    return <NoResultsMessage />
  }

  if (sortBy === AssetFieldNames.species) {
    const avatarsBySpeciesId = items.reduce((result, avatar) => {
      let speciesId

      if (avatar[AssetFieldNames.species].length) {
        speciesId = avatar[AssetFieldNames.species][0].id
      } else {
        speciesId = 'unknown'
      }

      return {
        ...result,
        [speciesId]: result[speciesId]
          ? result[speciesId].concat([avatar])
          : [avatar]
      }
    }, {})

    const entries = Object.entries(avatarsBySpeciesId)

    return (
      <div>
        {entries.map(([speciesId, avatars], idx) => {
          let matchingSpecies = species
            .concat([unknownSpecies])
            .find(({ id }) => id === speciesId)

          // if user changes species from A to B this could happen because race condition
          if (!matchingSpecies) {
            matchingSpecies = unknownSpecies
          }

          return (
            <div>
              <Heading variant="h2">
                <Link
                  to={routes.viewSpeciesWithVar.replace(
                    ':speciesIdOrSlug',
                    matchingSpecies[SpeciesFieldNames.slug] ||
                      matchingSpecies.id
                  )}>
                  {matchingSpecies[SpeciesFieldNames.pluralName]}
                </Link>
              </Heading>
              <Avatars avatars={avatars} />
              {idx === entries.length - 1 &&
              avatars.length !== matchingSpecies.avatarCount ? (
                <MoreAvatarsOnNextPage
                  remainingCount={matchingSpecies.avatarCount - avatars.length}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    )
  } else {
    return <Avatars avatars={items} />
  }
}

const analyticsActionCategory = 'AvatarPages'

const sortOptions = {
  'species desc': {
    fieldName: AssetFieldNames.species,
    direction: OrderDirections.DESC
  },
  'date asc': {
    fieldName: assetSortFields.createdAt,
    direction: OrderDirections.ASC
  },
  'date desc': {
    fieldName: assetSortFields.createdAt,
    direction: OrderDirections.DESC
  }
}

const getLabelForSorting = (fieldName, direction) => {
  switch (fieldName) {
    case AssetFieldNames.species:
      return 'Species'
    case assetSortFields.createdAt:
      switch (direction) {
        case OrderDirections.ASC:
          return 'Date (asc)'
        case OrderDirections.DESC:
          return 'Date (desc)'
      }
  }
  return '???'
}

const getViewCacheName = (includeAdult, fieldName, direction) => {
  const prefix = includeAdult ? 'nsfw' : 'sfw'

  switch (fieldName) {
    case AssetFieldNames.species:
      return `${prefix}_species`
    case assetSortFields.createdAt:
      return `${prefix}_date_${direction}`
  }

  throw new Error(
    `Could not get view cache name for field name "${fieldName}"!`
  )
}

export default () => {
  const { pageNumber: pageNumberFromUrl = 1 } = useParams()
  const { push } = useHistory()
  const [areFiltersVisible, setAreFiltersVisible] = useState(false)
  const classes = useStyles()
  const [activeFilters] = useStorage(avatarsFiltersStorageKey, [])
  const [assetsSortByFieldName] = useStorage(
    storageKeys.assetsSortByFieldName,
    AssetFieldNames.species
  )
  const [assetsSortByDirection] = useStorage(
    storageKeys.assetsSortByDirection,
    OrderDirections.DESC
  )
  const [activeSortFieldName, setActiveSortFieldName] = useState()
  const [activeSortDirection, setActiveSortDirection] = useState()
  const [, , user] = useUserRecord()
  const viewCacheName = getViewCacheName(
    user && user[UserFieldNames.enabledAdultContent],
    activeSortFieldName || assetsSortByFieldName,
    activeSortDirection || assetsSortByDirection
  )
  const [isLoadingSummary, isErrorLoadingSummary, summary] = useDatabaseQuery(
    'viewCache',
    `${viewCacheName}_summary`
  )

  const onNewSortFieldAndDirection = (fieldName, direction) => {
    setActiveSortFieldName(fieldName)
    setActiveSortDirection(direction)
    trackAction(analyticsActionCategory, 'Click sort by field and direction', {
      fieldName,
      direction
    })
  }

  const currentPageNumber = parseInt(pageNumberFromUrl)

  const { species, pageCount } = summary || {
    species: [],
    pageCount: 0
  }

  if (isLoadingSummary) {
    return <LoadingIndicator message="Loading avatars..." />
  }

  const isInvalid = !summary || !pageCount || !species.length

  if (isErrorLoadingSummary || isInvalid) {
    return (
      <ErrorMessage>
        Failed to load the avatars page (code{' '}
        {isErrorLoadingSummary ? '101' : '102'}). Please try again later
      </ErrorMessage>
    )
  }

  return (
    <AvatarPageContext.Provider
      value={{
        currentPageNumber,
        species,
        viewCacheName,
        sortBy: activeSortFieldName || assetsSortByFieldName
      }}>
      <div>
        <Helmet>
          <title>
            Browse 100s of avatars for VRChat, NeosVR, ChilloutVR and more |
            VRCArena
          </title>
          <meta
            name="description"
            content="Browse the huge collection of avatars for the various VR games such as VRChat, NeosVR and Chillout VR."
          />
        </Helmet>
        <Heading variant="h1">Avatars</Heading>
        <Species />
        <div className={classes.page}>
          {areFiltersVisible && <Filters />}

          <div className={classes.controls}>
            <div className={classes.control}>
              <SortDropdown
                options={sortOptions}
                label={getLabelForSorting(
                  activeSortFieldName || assetsSortByFieldName,
                  activeSortDirection || assetsSortByDirection
                )}
                fieldNameKey={storageKeys.assetsSortByFieldName}
                directionKey={storageKeys.assetsSortByDirection}
                onNewSortFieldAndDirection={onNewSortFieldAndDirection}
                onOpenDropdown={() =>
                  trackAction(analyticsActionCategory, 'Open sort dropdown')
                }
              />
            </div>
            <div className={classes.control}>
              <Button
                onClick={() => setAreFiltersVisible(currentVal => !currentVal)}
                icon={<CategoryIcon />}>
                Filters
                {activeFilters.length ? ` (${activeFilters.length})` : ''}
              </Button>
            </div>
          </div>
          <Page />
        </div>
        <PagesNavigation
          pageCount={pageCount}
          currentPageNumber={currentPageNumber}
          onClickWithPageNumber={pageNumber =>
            push(getUrlForPageNumber(pageNumber))
          }
        />
      </div>
    </AvatarPageContext.Provider>
  )
}
