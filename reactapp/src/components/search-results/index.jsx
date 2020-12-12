import React from 'react'
import { useSelector } from 'react-redux'

import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import useUserRecord from '../../hooks/useUserRecord'
import useStorage from '../../hooks/useStorage'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import AssetResults from '../asset-results'
import AuthorResults from '../author-results'
import NoResultsMessage from '../no-results-message'
import Button from '../button'
import PageControls from '../page-controls'
import UserList from '../user-list'

import { searchIndexNames } from '../../modules/app'
import * as routes from '../../routes'
import { trackAction } from '../../analytics'
import { alreadyOver18Key } from '../../config'

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
  const [isAlreadyOver18] = useStorage(alreadyOver18Key)

  const [isLoading, isErrored, hits] = useAlgoliaSearch(
    searchIndexName,
    searchTerm,
    (user && user.enabledAdultContent) || isAlreadyOver18
      ? undefined
      : 'isAdult != 1'
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

  switch (searchIndexName) {
    case searchIndexNames.ASSETS:
      return (
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
