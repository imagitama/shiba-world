import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  Operators,
  UserMetaFieldNames
} from '../../hooks/useDatabaseQuery'
import { quickReadRecord } from '../../firestore'

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
  const [users, setUsers] = useState(null)
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.UserMeta,
    [[UserMetaFieldNames.isPatron, Operators.EQUALS, true]]
  )
  const classes = useStyles()

  useEffect(() => {
    if (!results) {
      return
    }

    async function main() {
      console.log(results)

      // doing a lookup per user meta is probably very bad for performance :(
      setUsers(
        await Promise.all(
          results.map(async userMeta =>
            quickReadRecord(CollectionNames.Users, userMeta.id)
          )
        )
      )
    }

    main()
  }, [results !== null])

  if (isLoading || !users) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find patrons</ErrorMessage>
  }

  if (users && !users.length) {
    return <NoResultsMessage />
  }

  return (
    <div className={classes.root}>
      <UserList users={users} />
    </div>
  )
}
