import React from 'react'
import { useSelector } from 'react-redux'
import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SearchResult from '../search-result'
import SearchResultAuthor from '../search-result-author'
import NoResultsMessage from '../no-results-message'
import { searchIndexNames } from '../../modules/app'

export default () => {
  const { searchTerm, searchIndexName } = useSelector(
    ({ app: { searchTerm, searchIndexName } }) => ({
      searchTerm,
      searchIndexName
    })
  )
  const [, , user] = useUserRecord()

  const [isLoading, isErrored, hits] = useAlgoliaSearch(
    searchIndexName,
    searchTerm,
    user && user.enabledAdultContent ? undefined : 'isAdult != 1'
  )

  if (isLoading || !hits) {
    return <LoadingIndicator message="Searching..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to perform search</ErrorMessage>
  }

  if (!hits.length) {
    return (
      <NoResultsMessage>
        Nothing found matching your search term
      </NoResultsMessage>
    )
  }

  return (
    <>
      {hits.map(hit =>
        searchIndexName === searchIndexNames.ASSETS ? (
          <SearchResult key={hit.objectID} hit={hit} />
        ) : (
          <SearchResultAuthor key={hit.objectID} hit={hit} />
        )
      )}
    </>
  )
}
