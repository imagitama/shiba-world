import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import NoResultsMessage from '../../components/no-results-message'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'

function Assets({ authorName }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.authorName, Operators.EQUALS, authorName],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
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
    whereClauses
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets for author</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} />
}

export default ({
  match: {
    params: { authorName }
  }
}) => {
  return (
    <>
      <Helmet>
        <title>View assets created by author {authorName} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the assets that have been uploaded for the author ${authorName}.`}
        />
      </Helmet>

      <Heading variant="h1">
        <Link to={routes.viewAuthorWithVar.replace(':authorName', authorName)}>
          {authorName}
        </Link>
      </Heading>
      <Assets authorName={authorName} />
    </>
  )
}
