import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  Operators,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import UserList from '../user-list'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    marginTop: '2rem'
  }
})

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Users,
    [[UserFieldNames.isPatron, Operators.EQUALS, true]]
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find patrons</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return (
    <div className={classes.root}>
      <UserList users={results} />
    </div>
  )
}
