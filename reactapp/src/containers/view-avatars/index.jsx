import React, { useState, createContext, useContext } from 'react'
import { useParams, useHistory } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import CategoryIcon from '@material-ui/icons/Category'
import TodayIcon from '@material-ui/icons/Today'

import * as routes from '../../routes'
import useStorage from '../../hooks/useStorage'
import useDatabaseQuery, {
  AssetCategories,
  AssetFieldNames,
  mapDates,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import PagesNavigation from '../../components/pages-navigation'
import SpeciesVsSelector from '../../components/species-vs-selector'
import Heading from '../../components/heading'
import AssetResults from '../../components/asset-results'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'

import Filters from './components/filters'

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

function Page() {
  const { currentPageNumber, species } = useAvatarPage()
  const [isLoading, isError, page] = useDatabaseQuery(
    'avatarPages',
    `page${currentPageNumber}`
  )

  const { avatars } = page || { avatars: {} }

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

  if (!page || !avatars.length) {
    return <NoResultsMessage />
  }

  const avatarsBySpeciesId = avatars.reduce((result, avatar) => {
    return {
      ...result,
      [avatar.speciesId]:
        avatar.speciesId in result
          ? result[avatar.speciesId].concat([avatar])
          : [avatar]
    }
  }, {})

  const entries = Object.entries(avatarsBySpeciesId)

  return (
    <div>
      {entries.map(([speciesId, avatars], idx) => {
        const matchingSpecies = species.find(({ id }) => id === speciesId)

        if (!matchingSpecies) {
          throw new Error(
            `Could not find species with id "${speciesId}" (code 203)`
          )
        }

        return (
          <div>
            <Heading variant="h2">
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesIdOrSlug',
                  matchingSpecies[SpeciesFieldNames.slug] || matchingSpecies.id
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
}

function NewAvatars() {
  const { newAvatars } = useAvatarPage()

  console.log('new ones!', newAvatars)

  return (
    <>
      <Heading variant="h2">Most Recent (100)</Heading>
      <AssetResults assets={newAvatars.map(mapDates)} />
    </>
  )
}

export default () => {
  const [isLoadingSummary, isErrorLoadingSummary, summary] = useDatabaseQuery(
    'avatarPages',
    'summary'
  )
  const { pageNumber: pageNumberFromUrl = 1 } = useParams()
  const { push } = useHistory()
  const [areFiltersVisible, setAreFiltersVisible] = useState(false)
  const classes = useStyles()
  const [activeFilters] = useStorage(avatarsFiltersStorageKey, [])
  const [showNewAvatars, setShowNewAvatars] = useState(false)

  const currentPageNumber = parseInt(pageNumberFromUrl)

  const { species, pageCount, newAvatars } = summary || {
    species: [],
    pageCount: 0,
    newAvatars: []
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
      value={{ currentPageNumber, species, newAvatars }}>
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
        {!showNewAvatars && <Species />}
        <div className={classes.page}>
          {areFiltersVisible && <Filters />}

          <div className={classes.controls}>
            <div className={classes.control}>
              <Button
                onClick={() => setShowNewAvatars(currentVal => !currentVal)}
                icon={<TodayIcon />}>
                Toggle New Avatars
              </Button>
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
          {showNewAvatars ? <NewAvatars /> : <Page />}
        </div>
        {!showNewAvatars && (
          <PagesNavigation
            pageCount={pageCount}
            currentPageNumber={currentPageNumber}
            onClickWithPageNumber={pageNumber =>
              push(getUrlForPageNumber(pageNumber))
            }
          />
        )}
      </div>
    </AvatarPageContext.Provider>
  )
}
