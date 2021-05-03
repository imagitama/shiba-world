import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import Fireworks from '../../../../components/fireworks'

import Image from '../image'
import WarningMessage from '../warning-message'
import InfoMessage from '../info-message'

import buildSettingsUrl from './assets/images/build-settings.png'
import standardLiteShadersUrl from './assets/images/standard-lite-shaders.png'
import sdkErrorsUrl from './assets/images/sdk-errors.png'

const useStyles = makeStyles({
  headings: {
    textAlign: 'center'
  }
})

export default () => {
  const classes = useStyles()
  return (
    <div>
      <Helmet>
        <title>Quest compatibility | VRCArena</title>
        <meta
          name="description"
          content="How to make your VRChat avatar quest compatible."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Quest compatibility</Heading>
      </div>
      <p>There are extra steps required to make an avatar Quest compatible.</p>
      <Heading variant="h3">Quest requirements</Heading>
      <p>
        Because of performance limitations of the Quest headsets, VRChat imposes
        strict requirements for avatars before they are ever shown to Quest
        users.
      </p>
      <p>
        A Quest avatar is completely different to a PC one but they use the same
        blueprint ID and the game decides to switch to the Quest version for
        Quest users.
      </p>
      <ul>
        <li>under 20,000 polygons to always be shown</li>
        <li>under 75,000 polygons to be shown if the user opts-in</li>
        <li>no dynamic bones or dynamic bone colliders</li>
        <li>Android-only shaders</li>
        <li>no other special Unity components (cloth, colliders, etc.)</li>
      </ul>
      <WarningMessage message="If your avatar is over 75k polygons please contact the original author to ask them if they have a Quest version of the avatar." />
      <InfoMessage message="Some avatars include a different Quest version of the same model. If yours does, try importing that into your Unity project and apply your textures to it." />
      <Heading variant="h3">Switch to Android mode</Heading>
      <Image src={buildSettingsUrl} alt="Unity project build settings" />
      <ol>
        <li>
          in your Unity project switch to Android by going to "File..." and
          "Build Settings..."
        </li>
        <li>select the Android platform from the list</li>
        <li>
          install it if necessary otherwise click "Switch Platform" (it will
          take 5-10 mins depending on how many assets your project has)
        </li>
      </ol>
      <Heading variant="h3">Create a scene</Heading>
      <p>
        It is important that you create a new scene only for the Quest version
        of your avatar. That way you can remove all of the Unity components
        while keeping your PC version.
      </p>
      <Heading variant="h3">Remove incompatible Unity components</Heading>
      <p>
        in the Hierarchy panel inspect every single game object in the hierarchy
        and remove any Dynamic Bone and Dynamic Bone Collider component
      </p>
      <InfoMessage message="Open the VRC SDK control panel and it will tell you if any components are remaining." />
      <Heading variant="h3">Change shaders</Heading>
      <p>You must use special Android-only shaders for Quest avatars.</p>
      <ol>
        <li>find your materials (possibly under "My Materials")</li>
        <li>create a new folder called "Quest"</li>
        <li>duplicate all materials into that folder</li>
        <li>
          inspect each material and change the shader from "Standard" to
          "Standard Lite" (see image)
        </li>
        <li>apply your new material to the avatar in your Quest scene</li>
      </ol>
      <Image src={standardLiteShadersUrl} alt="Standard Lite shader" />
      <Heading variant="h3">Upload</Heading>
      <Image
        src={sdkErrorsUrl}
        alt="The VRChat SDK control panel complaining about using the wrong shaders"
      />
      <p>
        Assuming the VRChat SDK control panel does not complain about
        incompatible Unity components or shaders, you can proceed with the
        upload just like you did for your PC avatar.
      </p>
      <InfoMessage
        message={`When you upload your Quest avatar it will say "Update Avatar". You are updating your avatar by adding a Quest version to it.`}
      />
    </div>
  )
}
