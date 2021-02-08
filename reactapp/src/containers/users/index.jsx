import React from 'react'
import { Helmet } from 'react-helmet'

import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Message, { styles as messageStyles } from '../../components/message'

import {
  CollectionNames,
  UserFieldNames,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'
import useInfiniteDatabaseQuery from '../../hooks/useInfiniteDatabaseQuery'

export default () => {
  const [
    isLoading,
    isErrored,
    users,
    isAtEndOfQuery
  ] = useInfiniteDatabaseQuery(
    false,
    CollectionNames.Users,
    [[UserFieldNames.username, Operators.NOT_EQUALS, '']],
    [UserFieldNames.username, OrderDirections.ASC]
  )

  if (isErrored) {
    return <ErrorMessage>Failed to get users</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>
          View a list of users that are signed up on the site | VRCArena
        </title>
        <meta
          name="description"
          content={`Find every user that has signed up to VRCArena with a different category for staff members to help you connect with them.`}
        />
      </Helmet>
      <Heading variant="h1">All Users</Heading>
      <Message>
        Looking for a particular user? Use the search bar at the top and select
        "Users" from the dropdown
      </Message>
      <UserList users={users || []} />
      {isLoading ? (
        <LoadingIndicator message="Loading users..." />
      ) : (
        <Message style={messageStyles.BG}>
          {isAtEndOfQuery
            ? 'No more results found'
            : 'Scroll to load more results'}
        </Message>
      )}
    </>
  )
}
