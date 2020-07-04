import React from 'react'
import { Link } from 'react-router-dom'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AvatarUploadForm from '../../components/avatar-upload-form'
// import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'
import DarkModeToggle from '../../components/darkmode-toggle'
import MyUploads from '../../components/my-uploads'
import SocialMediaUsernamesEditor from '../../components/social-media-usernames-editor'
import BioEditor from '../../components/bio-editor'

import useUserRecord from '../../hooks/useUserRecord'
import * as routes from '../../routes'

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
      <BodyText>
        Hi,{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
          {user.username}
        </Link>
        !
      </BodyText>

      <Heading variant="h2">Avatar</Heading>
      <AvatarUploadForm />

      <Heading variant="h2">Bio</Heading>
      <BioEditor />
      <Heading variant="h2">Profile settings</Heading>
      <AdultContentToggle />
      <br />
      <DarkModeToggle />
      <Heading variant="h2">Social Media</Heading>
      <p>These are shown to everyone on your profile.</p>
      <SocialMediaUsernamesEditor />
      {/* <Heading variant="h2">Change your name</Heading>
      <UsernameEditor /> */}
      <Heading variant="h2">Your Uploads</Heading>
      <MyUploads />
    </>
  )
}
