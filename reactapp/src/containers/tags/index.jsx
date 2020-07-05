import React from 'react'
import { Helmet } from 'react-helmet'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import AllTagsBrowser from '../../components/all-tags-browser'
import NoResultsMessage from '../../components/no-results-message'

import * as routes from '../../routes'

function Assets({ tagName }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.tags, Operators.ARRAY_CONTAINS, tagName]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!results.length) {
    return (
      <NoResultsMessage
        callToActionUrl={routes.searchWithVar.replace(':searchTerm', tagName)}
        callToActionLabel="Try search instead"
      />
    )
  }

  return <AssetResults assets={results} />
}

export default ({
  match: {
    params: { tagName }
  }
}) => {
  return (
    <>
      <Helmet>
        <title>Browse everything with tag "{tagName}" | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the accessories, tutorials, animations, avatars and news articles with the tag ${tagName}`}
        />
      </Helmet>
      <Heading variant="h1">Browse tag "{tagName}"</Heading>
      <Assets tagName={tagName} />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
