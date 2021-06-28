import React, { useState, createContext, useContext } from 'react'
import { useParams, useHistory } from 'react-router'
import { makeStyles } from '@material-ui/core/styles'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import { Link } from 'react-router-dom'

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
      textShadow: '1px 1px 1px',
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
    right: 0
  }
})

const AvatarPageContext = createContext({ currentPageNumber: null })
const useAvatarPage = () => useContext(AvatarPageContext)

const getUrlForPageNumber = pageNumber =>
  routes.viewCategoryWithVarAndPageVar
    .replace(':categoryName', AssetCategories.avatar)
    .replace(':pageNumber', pageNumber)

const getPageNumberForSpeciesId = (speciesWithPageNumbers, speciesId) => {
  const match = speciesWithPageNumbers.find(({ id }) => id === speciesId)
  return match.pageNumber
}

function Species() {
  const { speciesWithPageNumbers, currentPageNumber } = useAvatarPage()
  const { push } = useHistory()
  const [isExpanded, setIsExpanded] = useState(false)
  const classes = useStyles()

  const onSpeciesClickWithId = speciesId => {
    const pageNumber = getPageNumberForSpeciesId(
      speciesWithPageNumbers,
      speciesId
    )

    setIsExpanded(false)
    push(getUrlForPageNumber(pageNumber))
  }

  const selectedSpeciesIds = speciesWithPageNumbers
    .filter(item => parseInt(item.pageNumber) === currentPageNumber)
    .map(({ id }) => id)

  return (
    <div
      className={`${classes.species} ${isExpanded ? '' : classes.unexpanded}`}>
      <SpeciesVsSelector
        species={speciesWithPageNumbers}
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

function Page() {
  const { currentPageNumber, speciesWithPageNumbers } = useAvatarPage()
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

  return (
    <div>
      {Object.entries(avatarsBySpeciesId).map(([speciesId, avatars]) => {
        const matchingSpecies = speciesWithPageNumbers.find(
          ({ id }) => id === speciesId
        )

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
                  ':speciesId',
                  matchingSpecies.id
                )}>
                {matchingSpecies[SpeciesFieldNames.pluralName]}
              </Link>
            </Heading>
            <Avatars avatars={avatars} />
          </div>
        )
      })}
    </div>
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

  const currentPageNumber = parseInt(pageNumberFromUrl)

  const { speciesWithPageNumbers, pageCount } = summary || {
    speciesWithPageNumbers: [],
    pageCount: 0
  }

  if (isLoadingSummary) {
    return <LoadingIndicator message="Loading avatars..." />
  }

  const isInvalid = !summary || !pageCount || !speciesWithPageNumbers.length

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
      value={{ currentPageNumber, speciesWithPageNumbers }}>
      <div>
        <Heading variant="h1">Avatars</Heading>
        <Species />
        <div className={classes.page}>
          {areFiltersVisible && <Filters />}

          <div className={classes.controls}>
            <div className={classes.control}>
              <Button
                onClick={() => setAreFiltersVisible(currentVal => !currentVal)}
                icon={
                  activeFilters.length ? (
                    <CheckBoxIcon />
                  ) : (
                    <CheckBoxOutlineBlankIcon />
                  )
                }>
                Filters
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
