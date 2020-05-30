import React from 'react'
import withRedirectOnNotAuth from '../../hocs/withRedirectOnNotAuth'
import withAuthProfile from '../../hocs/withAuthProfile'
import useDatabase from '../../hooks/useDatabase'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'

const MyAccount = ({ auth }) => {
  const [isLoading, isErrored, user] = useDatabase(
    CollectionNames.Users,
    auth.uid
  )

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
      <UsernameEditor userId={user.id} record={user} />
      <Heading variant="h2">Profile settings</Heading>
      <AdultContentToggle />
    </>
  )
}

export default withRedirectOnNotAuth(withAuthProfile(MyAccount))
