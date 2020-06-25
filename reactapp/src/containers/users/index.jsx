import React from 'react'
import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'

function isUserStaff(user) {
  return user.isAdmin || user.isEditor
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

  console.log(staffUsers, nonStaffUsers)

  return (
    <>
      <Heading variant="h1">All Users</Heading>
      <Heading variant="h2">Staff</Heading>
      <p>
        Staff members can approve, edit and delete assets. Click their name to
        find their social media to ask them for help about assets.
      </p>
      <UserList users={staffUsers} />
      <Heading variant="h2">Users</Heading>
      <UserList users={nonStaffUsers} />
    </>
  )
}
