import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import AuthorResults from '../../components/author-results'
import NoResultsMessage from '../../components/no-results-message'

import useDatabaseQuery, {
  CollectionNames
  // RequestsFieldNames,
  // Operators
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

function Authors() {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Authors
    //[[RequestsFieldNames.isDeleted, Operators.EQUALS, false]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get authors</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AuthorResults authors={results} />
}

export default () => {
  return (
    <>
      <Helmet>
        <title>View all authors | VRCArena</title>
        <meta
          name="description"
          content="Browse all of the authors who have assets on the site."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.authors}>Authors</Link>
      </Heading>
      <BodyText>A list of all authors who have assets on the site.</BodyText>
      <Authors />
    </>
  )
}
