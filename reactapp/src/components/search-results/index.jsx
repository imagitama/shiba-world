import React from 'react'
import { useSelector } from 'react-redux'

import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import AuthorResults from '../author-results'
import NoResultsMessage from '../no-results-message'
import Button from '../button'
import PageControls from '../page-controls'

import { searchIndexNames } from '../../modules/app'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'

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
      <>
        <NoResultsMessage>
          Nothing found matching your search term
        </NoResultsMessage>
        {searchIndexName === searchIndexNames.AUTHORS && <ViewAllAuthorsBtn />}
      </>
    )
  }

  return (
    <>
      {searchIndexName === searchIndexNames.ASSETS ? (
        <AssetResults
          assets={hits.map(hit => ({
            id: hit.objectID,
            title: hit.title,
            description: hit.description,
            thumbnailUrl: hit.thumbnailUrl,
            isApproved: true,
            _highlightResult: hit._highlightResult
          }))}
        />
      ) : (
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
      )}
    </>
  )
}
