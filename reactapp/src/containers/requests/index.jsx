import React from 'react'
import { Helmet } from 'react-helmet'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import FormattedDate from '../../components/formatted-date'
import Button from '../../components/button'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
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
  request: { id, title, description, isClosed, createdBy, createdAt }
}) {
  const classes = useStyles()
  return (
    <Paper className={classes.request}>
      {isClosed && (
        <>
          <strong>CLOSED!</strong>
          <br />
        </>
      )}
      <div className={classes.title}>
        <Link to={routes.viewRequestWithVar.replace(':requestId', id)}>
          {title}
        </Link>
      </div>
      <div className={classes.description}>{description}</div>
      <div className={classes.meta}>
        Created by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
          {createdBy.username}
        </Link>{' '}
        <FormattedDate date={createdAt} />
      </div>
    </Paper>
  )
}

function Requests() {
  const classes = useStyles()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Requests
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get requests</ErrorMessage>
  }

  if (!results.length) {
    return 'No results'
  }

  return (
    <div className={classes.container}>
      {results.map(result => (
        <Request key={result.id} request={result} />
      ))}
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
