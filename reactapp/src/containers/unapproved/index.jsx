import React from 'react'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import Heading from '../../components/heading'
import UnapprovedAssets from '../../components/unapproved-assets'

export default () => {
  const [isLoadingProfile, isErrorLoadingProfile, user] = useUserRecord()

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingProfile) {
    return <ErrorMessage>Failed to load your user profile</ErrorMessage>
  }

  if (!user || !user.isEditor) {
    return <NoPermissionMessage />
  }

  return (
    <div>
      <Heading variant="h1">Unapproved assets</Heading>
      <UnapprovedAssets />
    </div>
  )
}
