import React from 'react'
import { useSelector } from 'react-redux'
import useAlgoliaSearch, { Indexes } from '../../hooks/useAlgoliaSearch'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import SearchResult from '../search-result'

export default () => {
  const { searchTerm } = useSelector(({ app: { searchTerm } }) => ({
    searchTerm
  }))
  const [, , user] = useUserRecord()

  const [isLoading, isErrored, hits] = useAlgoliaSearch(
    Indexes.Assets,
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
    return 'Nothing found matching your search term'
  }

  return (
    <>
      {hits.map(hit => (
        <SearchResult key={hit.objectID} hit={hit} />
      ))}
    </>
  )
}
