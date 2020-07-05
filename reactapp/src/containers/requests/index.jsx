import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'
import SimpleResultsItem from '../../components/simple-results-item'
import NoResultsMessage from '../../components/no-results-message'

import useDatabaseQuery, {
  CollectionNames,
  RequestsFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import * as routes from '../../routes'

const useStyles = makeStyles({
  container: {
    marginTop: '1rem'
  },
  request: {
    padding: '1rem'
  },
  title: {
    fontSize: '150%',
    marginBottom: '0.5rem'
  },
  meta: {
    marginTop: '1rem'
  }
})

function Request({
  request: { id, title, description, createdBy, createdAt }
}) {
  return (
    <SimpleResultsItem
      url={routes.viewRequestWithVar.replace(':requestId', id)}
      title={title}
      description={description}
      author={createdBy}
      date={createdAt}
    />
  )
}

function Requests() {
  const classes = useStyles()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Requests,
    [[RequestsFieldNames.isDeleted, Operators.EQUALS, false]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get requests</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  const { activeRequests, closedRequests } = results.reduce(
    ({ activeRequests, closedRequests }, result) => ({
      activeRequests:
        result.isClosed === false
          ? activeRequests.concat(result)
          : activeRequests,
      closedRequests:
        result.isClosed === true
          ? activeRequests.concat(result)
          : closedRequests
    }),
    { activeRequests: [], closedRequests: [] }
  )

  return (
    <div className={classes.container}>
      <Heading variant="h2">Active</Heading>
      {activeRequests.length ? (
        activeRequests.map(result => (
          <Request key={result.id} request={result} />
        ))
      ) : (
        <NoResultsMessage>No active requests</NoResultsMessage>
      )}
      <Heading variant="h2">Closed</Heading>
      {closedRequests.length ? (
        closedRequests.map(result => (
          <Request key={result.id} request={result} />
        ))
      ) : (
        <NoResultsMessage>No closed requests</NoResultsMessage>
      )}
    </div>
  )
}

export default () => {
  const [, , user] = useUserRecord()
  return (
    <>
      <Helmet>
        <title>
          View requests for accessories, animations, tutorials, avatars and more
          | VRCArena
        </title>
        <meta
          name="description"
          content="Browse all of the requests from users who are seeking assets for their VRChat avatar."
        />
      </Helmet>
      <Heading variant="h1">Requests</Heading>
      <BodyText>A list of requests for accessories.</BodyText>
      <br />
      {user && <Button url={routes.createRequest}>Create Request</Button>}
      <Requests />
    </>
  )
}
