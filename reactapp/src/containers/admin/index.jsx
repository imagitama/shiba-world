import React from 'react'

import AdminUserManagement from '../../components/admin-user-management'
import Heading from '../../components/heading'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import AdminHistory from '../../components/admin-history'

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (!user || !user.isAdmin) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Admin</Heading>
      <hr />
      Your user ID: {user.id}
      <hr />
      <h2>Admin User Management</h2>
      <AdminUserManagement />
      <h2>History</h2>
      <AdminHistory />
    </>
  )
}
