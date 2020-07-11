import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import * as routes from '../../routes'
import ErrorContainer from '../error'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import NoResultsMessage from '../../components/no-results-message'

import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

function Assets() {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, true],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ]

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    user && user[UserFieldNames.enabledAdultContent] ? whereClauses : false // do not query if not logged in and have it enabled
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} showPinned />
}

export default () => {
  const [, , user] = useUserRecord()

  if (!user || !user[UserFieldNames.enabledAdultContent]) {
    return <ErrorContainer code="404" message="Not found" />
  }

  return (
    <>
      <Helmet>
        <title>View adult assets | VRCArena</title>
        <meta name="description" content="View a list of adult assets" />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.adultAssets}>Adult Assets</Link>
      </Heading>
      <Assets />
    </>
  )
}
