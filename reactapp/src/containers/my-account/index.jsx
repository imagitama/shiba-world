import React from 'react'
import { Link } from 'react-router-dom'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import AvatarUploadForm from '../../components/avatar-upload-form'
import UsernameEditor from '../../components/username-editor'
import AdultContentToggle from '../../components/adult-content-toggle'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import NoPermissionMessage from '../../components/no-permission-message'
import DarkModeToggle from '../../components/darkmode-toggle'
import MyUploads from '../../components/my-uploads'
import SocialMediaUsernamesEditor from '../../components/social-media-usernames-editor'
import BioEditor from '../../components/bio-editor'

import useUserRecord from '../../hooks/useUserRecord'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'

function WelcomeMessage() {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve your account details</ErrorMessage>
  }

  return (
    <BodyText>
      Hi,{' '}
      <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
        {user.username}
      </Link>
      !
    </BodyText>
  )
}

const analyticsCategoryName = 'MyAccount'

export default () => {
  const userId = useFirebaseUserId()

  if (!userId) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Your Account</Heading>
      <WelcomeMessage />

      <Heading variant="h2">Username</Heading>
      <UsernameEditor
        onSaveClick={() =>
          trackAction(analyticsCategoryName, 'Click save username')
        }
      />

      <Heading variant="h2">Avatar</Heading>
      <AvatarUploadForm
        onClick={() =>
          trackAction(analyticsCategoryName, 'Click avatar upload form')
        }
      />

      <Heading variant="h2">Bio</Heading>
      <BioEditor
        onSaveClick={() =>
          trackAction(analyticsCategoryName, 'Click save bio button')
        }
      />

      <Heading variant="h2">Profile settings</Heading>
      <AdultContentToggle
        onClick={({ newValue }) =>
          trackAction(
            analyticsCategoryName,
            newValue === true ? 'Enable adult content' : 'Disable adult content'
          )
        }
      />
      <br />
      <DarkModeToggle
        onClick={({ newValue }) =>
          trackAction(
            analyticsCategoryName,
            newValue === true ? 'Enable dark mode' : 'Disable dark mode'
          )
        }
      />

      <Heading variant="h2">Social Media</Heading>
      <p>These are shown to everyone on your profile.</p>
      <SocialMediaUsernamesEditor
        onSaveClick={() =>
          trackAction(analyticsCategoryName, 'Click save social media')
        }
      />

      <Heading variant="h2">Your Uploads</Heading>
      <MyUploads />
    </>
  )
}
