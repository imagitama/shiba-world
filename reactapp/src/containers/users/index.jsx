import React from 'react'
import { Helmet } from 'react-helmet'
import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'

function isUserStaff(user) {
  return user.isAdmin || user.isEditor
}

function sortByAlpha(users) {
  return users.sort((userA, userB) =>
    userA[UserFieldNames.username].localeCompare(userB[UserFieldNames.username])
  )
}

export default () => {
  const [isLoading, isErrored, users] = useDatabaseQuery(CollectionNames.Users)

  if (isLoading) {
    return <LoadingIndicator message="Loading users..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get users</ErrorMessage>
  }

  const { staffUsers, nonStaffUsers } = users.reduce(
    (obj, user) => {
      if (isUserStaff(user)) {
        return {
          ...obj,
          staffUsers: obj.staffUsers.concat([user])
        }
      }
      return {
        ...obj,
        nonStaffUsers: obj.nonStaffUsers.concat([user])
      }
    },
    { staffUsers: [], nonStaffUsers: [] }
  )

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
      <Heading variant="h2">Staff</Heading>
      <p>
        Staff members can approve, edit and delete assets. Click their name to
        find their social media to ask them for help about assets.
      </p>
      <UserList users={sortByAlpha(staffUsers)} />
      <Heading variant="h2">Users</Heading>
      <UserList users={sortByAlpha(nonStaffUsers)} />
    </>
  )
}
