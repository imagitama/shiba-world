import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  ProfileFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import StreamsListItem from '../streams-list-item'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    marginTop: '2rem'
  }
})

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Profiles,
    [[ProfileFieldNames.twitchUsername, Operators.GREATER_THAN, '']]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find profiles</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return (
    <div className={classes.root}>
      {results.map(({ id, twitchUsername }) => (
        <StreamsListItem key={id} twitchUsername={twitchUsername} />
      ))}
    </div>
  )
}
