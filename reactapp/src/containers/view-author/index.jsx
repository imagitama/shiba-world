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
  AssetFieldNames,
  AuthorFieldNames
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'

function AssetsByAuthorId({ authorId }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [
      AssetFieldNames.author,
      Operators.EQUALS,
      createRef(CollectionNames.Authors, authorId)
    ],
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
    return <ErrorMessage>Failed to get assets by author name</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} />
}

function AssetsByAuthorName({ authorName, authorId }) {
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

  const resultsWithoutDupes = results.filter(result => {
    if (result.author) {
      if (result.author.id === authorId) {
        return false
      }
    }
    return true
  })

  if (!resultsWithoutDupes.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={resultsWithoutDupes} />
}

export default ({
  match: {
    params: { authorId }
  }
}) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Authors,
    authorId
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get author</ErrorMessage>
  }

  if (!result) {
    return <NoResultsMessage />
  }

  const { [AuthorFieldNames.name]: name } = result

  return (
    <>
      <Helmet>
        <title>View assets created by author {name} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the assets that have been uploaded for the author ${name}.`}
        />
      </Helmet>

      <Heading variant="h1">
        <Link to={routes.viewAuthorWithVar.replace(':authorId', authorId)}>
          {name}
        </Link>
      </Heading>
      <AssetsByAuthorId authorId={authorId} />
      <Heading variant="h2">More Results</Heading>
      <AssetsByAuthorName authorName={name} authorId={authorId} />
    </>
  )
}
