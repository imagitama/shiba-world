import React from 'react'

import Heading from '../../components/heading'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import NoPermissionMessage from '../../components/no-permission-message'
import ErrorMessage from '../../components/error-message'
import AdminAssetAmendments from '../../components/admin-asset-amendments'

function isUserEditorOrAdmin(user) {
  return user && (user.isAdmin || user.isEditor)
}

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (!user || !isUserEditorOrAdmin(user)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Admin</Heading>
      <Heading variant="h2">Pending Asset Amendments</Heading>
      <p>Please give a few days for the original author to approve or deny.</p>
      <AdminAssetAmendments />
    </>
  )
}
