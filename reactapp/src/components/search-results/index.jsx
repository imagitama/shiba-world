import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import useUserRecord from '../../hooks/useUserRecord'
import useStorage from '../../hooks/useStorage'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import AuthorResults from '../author-results'
import NoResultsMessage from '../no-results-message'
import Message from '../message'
import Button from '../button'
import PageControls from '../page-controls'
import UserList from '../user-list'
import SearchFilters from '../search-filters'

import { searchIndexNames } from '../../modules/app'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import {
  alreadyOver18Key,
  activeSearchFilterNamesKey,
  searchFilterNames
} from '../../config'
import { AssetFieldNames } from '../../hooks/useDatabaseQuery'

function ViewAllAuthorsBtn() {
  return (
    <PageControls>
      <Button
        url={routes.authors}
        onClick={() =>
          trackAction('SearchResults', 'Click view all authors button')
        }>
        View All Authors
      </Button>
    </PageControls>
  )
}

function Results({ isLoading, isErrored, searchIndexName, hits }) {
  const { searchFilters } = useSelector(({ app: { searchFilters } }) => ({
    searchFilters
  }))

  if (isLoading || !hits) {
    return <LoadingIndicator message="Searching..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to perform search</ErrorMessage>
  }

  console.debug(searchFilters)

  if (!hits.length) {
    return (
      <>
        <NoResultsMessage>
          Nothing found matching your search term
          {searchFilters.length
            ? ` (${searchFilters.length} filter${
                searchFilters.length > 1 ? 's' : ''
              } applied)`
            : ''}
        </NoResultsMessage>
        {searchIndexName === searchIndexNames.AUTHORS && <ViewAllAuthorsBtn />}
      </>
    )
  }

  switch (searchIndexName) {
    case searchIndexNames.ASSETS:
      return (
        <AssetResults
          showCategory
          showCost
          assets={hits.map(hit => ({
            id: hit.objectID,
            title: hit.title,
            description: hit.description,
            thumbnailUrl: hit.thumbnailUrl,
            category: hit.category,
            tags: hit.tags,
            [AssetFieldNames.slug]: hit.slug,
            _highlightResult: hit._highlightResult
          }))}
        />
      )
    case searchIndexNames.AUTHORS:
      return (
        <>
          <AuthorResults
            authors={hits.map(hit => ({
              id: hit.objectID,
              name: hit.name,
              description: hit.description,
              categories: hit.categories
            }))}
          />
          <ViewAllAuthorsBtn />
        </>
      )
    case searchIndexNames.USERS:
      return (
        <UserList
          users={hits.map(hit => ({
            id: hit.objectID,
            username: hit.username,
            avatarUrl: hit.avatarUrl
          }))}
        />
      )
    default:
      return 'Unknown search index to show results for'
  }
}

const filterNameTags = 'field:tags'

const adultSearchTerms = [
  'nsfw',
  'penis',
  'vagina',
  'sex',
  'genitals',
  'pussy',
  'dick',
  'cock'
]

const isSearchTermAdult = searchTerm => {
  for (const adultSearchTerm of adultSearchTerms) {
    if (searchTerm.includes(adultSearchTerm)) {
      return true
    }
  }

  return false
}

const AdultContentMessage = () => (
  <Message>
    It looks like you have searched for adult content but you do not have it
    enabled. Adult content is filtered out by default.{' '}
    <Link to={routes.signUp}>Sign up</Link> and enable it in your settings
  </Message>
)

// tags are a special boolean
const mapSearchFiltersForAlgolia = searchFiltersWithColon =>
  searchFiltersWithColon.filter(id => id !== filterNameTags)

export default () => {
  const { searchTerm, searchIndexName, searchFilters } = useSelector(
    ({ app: { searchTerm, searchIndexName, searchFilters } }) => ({
      searchTerm,
      searchIndexName,
      searchFilters
    })
  )
  const [, , user] = useUserRecord()
  const [isAlreadyOver18] = useStorage(alreadyOver18Key)
  const isAdultContentEnabled =
    (user && user.enabledAdultContent) || isAlreadyOver18
  const [isLoading, isErrored, hits] = useAlgoliaSearch(
    searchIndexName,
    searchTerm,
    [
      isAdultContentEnabled ? undefined : 'isAdult != 1',
      ...mapSearchFiltersForAlgolia(searchFilters)
    ],
    searchFilters.includes(filterNameTags)
  )

  return (
    <>
      {isSearchTermAdult(searchTerm) && !isAdultContentEnabled ? (
        <AdultContentMessage />
      ) : null}
      <SearchFilters />
      <Results
        isLoading={isLoading}
        isErrored={isErrored}
        searchIndexName={searchIndexName}
        hits={hits || []}
      />
    </>
  )
}
