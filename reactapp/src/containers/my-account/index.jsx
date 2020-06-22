import React from 'react'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'
import DarkModeToggle from '../../components/darkmode-toggle'
import AssetResults from '../../components/asset-results'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

function MyUploads() {
  const userId = useFirebaseUserId()
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [isLoading, isErrored, assets] = useDatabaseQuery(
    CollectionNames.Assets,
    [
      [AssetFieldNames.createdBy, Operators.EQUALS, userDocument],
      [AssetFieldNames.isDeleted, Operators.EQUALS, false]
    ]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find your uploaded assets</ErrorMessage>
  }

  return <AssetResults assets={assets} showCategory />
}

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve your account details</ErrorMessage>
  }

  if (!user) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Your Account</Heading>
      <BodyText>Hi, {user.username}!</BodyText>
      <Heading variant="h2">Change your name</Heading>
      <UsernameEditor />
      <Heading variant="h2">Profile settings</Heading>
      <AdultContentToggle />
      <br />
      <DarkModeToggle />
      <Heading variant="h2">Your Uploads</Heading>
      <MyUploads />
    </>
  )
}
