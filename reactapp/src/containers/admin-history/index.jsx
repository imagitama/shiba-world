import React from 'react'

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
      <Heading variant="h2">History</Heading>
      <AdminHistory />
    </>
  )
}
