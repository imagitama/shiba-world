import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import Button from '../../../../components/button'

import WarningMessage from '../warning-message'
import InfoMessage from '../info-message'
import Image from '../image'

import builderWithErrorUrl from './assets/images/builder-with-error.png'
import pipelineManagerUrl from './assets/images/pipeline-manager.png'
import toastacugaAvatarDescriptorUrl from './assets/images/toastacuga-avatar-descriptor.png'
import builderReadyUrl from './assets/images/builder-ready.png'
import uploadToastacugaUrl from './assets/images/upload-toastacuga.png'

const useStyles = makeStyles({
  headings: {
    textAlign: 'center'
  }
})

export default () => {
  const classes = useStyles()
  const [isAvatarAlreadySetUp, setIsAvatarAlreadySetUp] = useState(false)

  return (
    <div>
      <Helmet>
        <title>Upload your VRChat avatar | VRCArena</title>
        <meta
          name="description"
          content="The steps for uploading your VRChat avatar using Unity and the SDK."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Upload</Heading>
      </div>
      <Heading variant="h3">Log in to VRChat SDK</Heading>
      <ol>
        <li>
          click "VRChat SDK" in the toolbar then click "Show control panel"
        </li>
        <li>
          in the panel that appears enter your username and password for VRChat
          and click "Sign In"
        </li>
      </ol>
      {isAvatarAlreadySetUp === false && (
        <>
          <Heading variant="h3">Add VRChat SDK component</Heading>
          <p>
            Your avatar must have a special component attached to your avatar
            game object in your hierarchy. Usually VRChat avatars include this
            for you.
          </p>
          <Button onClick={() => setIsAvatarAlreadySetUp(true)}>
            My avatar already has the "VRC Avatar Descriptor" component
          </Button>
          <ol>
            <li>click the avatar in the hierarchy (eg. "Nargacuga")</li>
            <li>in the Inspector panel click "Add Component"</li>
            <li>search for and add "VRC Avatar Descriptor"</li>
          </ol>
          <p>
            This is the Toastacuga avatar descriptor <em>after</em> it has been
            configured (note it does not come with custom gestures or
            expressions menu working without further work):
          </p>
          <Image
            src={toastacugaAvatarDescriptorUrl}
            alt="Toastacuga avatar descriptor"
          />
          <Heading variant="h4">Set view position</Heading>
          <ol>
            <li>expand "View" and for "View Position" click "Edit"</li>
            <li>
              move the object that appears in the scene until you are happy with
              it
            </li>
            <li>click the green "Return" button to save it</li>
          </ol>
          <Heading variant="h4">Lip Sync</Heading>
          <ol>
            <li>expand "LipSync"</li>
            <li>
              click "Auto Detect!" and hopefully the SDK can detect everything
              needed for lip sync to work
            </li>
          </ol>
          <WarningMessage message="If auto detect does not work please contact the original author for further help." />
          <Heading variant="h4">Eye Look</Heading>
          <ol>
            <li>expand "Eye Look" and click "Enable"</li>
            <li>
              in the "Eyes" area for each eye click the black dot on the far
              right to select a new bone to use for your eye
            </li>
            <li>
              search for "left eye" and the first result is probably correct
            </li>
          </ol>
          <WarningMessage message="If you cannot find the correct eye bone please contact the original author for further help." />
          <Heading variant="h4">Playable Layers</Heading>
          <p>This section handles your hand gestures.</p>
          <WarningMessage message="If this is not already set up for your avatar we recommend contacting the original author for help setting this up." />
          <p>Assuming your avatar comes with custom gestures:</p>
          <ol>
            <li>expand "Playable Layers" and click "Customize"</li>
            <li>for "Gesture" click "Default Gesture"</li>
            <li>click the black dot to select a new animator controller</li>
            <li>search for "gestures" and select it if available</li>
          </ol>
          <Heading variant="h4">Expressions</Heading>
          <p>This section handles the expressions menu.</p>
          <WarningMessage message="If this is not already set up for your avatar we recommend contacting the original author for help setting this up." />
          <p>Assuming your avatar comes with a custom expressions menu:</p>
          <ol>
            <li>expand "Expressions" and click "Customize"</li>
            <li>
              for "Menu" click the black dot and search for "expressions" and if
              found, select it
            </li>
            <li>
              for "Parameters" click the black dot and search for "parameters"
              and if found, select it
            </li>
          </ol>
        </>
      )}
      <Heading variant="h3">Configure pipeline</Heading>
      <Image src={pipelineManagerUrl} alt="Pipeline manager" />
      <p>
        Every avatar uploaded to VRChat has a "blueprint ID" associated with it.
        This ID is unique and you can detach (remove) and attach (add) it to any
        avatar.
      </p>
      <p>
        Before you upload an avatar you should ensure the blueprint ID is
        correct. If you are creating a new avatar you can leave it blank.
      </p>
      <ol>
        <li>find the "Pipeline Manager" component for your avatar</li>
        <li>enter the blueprint ID if you have one and click "Attach"</li>
      </ol>
      <InfoMessage
        message={`You can get the blueprint ID of any of your avatars by going to the Content Manager tab of the SDK Control Panel and clicking "Copy ID" next to the avatar.`}
      />
      <Heading variant="h3">Test</Heading>
      <Image src={builderWithErrorUrl} alt="Builder panel with an error" />
      <p>
        You can test your avatar inside VRChat without actually uploading it so
        you can see if it works.
      </p>
      <ol>
        <li>open the VRChat SDK control panel</li>
        <li>click the "Builder" tab</li>
        <li>
          resolve any issues with a red exclamation mark (a common one is "This
          avatar has mipmapped textures without 'Streaming Mip Maps' enabled." -
          you can auto-fix this one)
        </li>
        <li>when the button "Build {`&`} Test" can be clicked on, click it</li>
        <li>
          launch VRChat and under Avatars scroll down to "Others" and switch to
          the avatar that is named the same as your avatar in Unity
        </li>
      </ol>
      <WarningMessage message="No other players will be able to see a test avatar. They will instead see your last used avatar." />
      <Heading variant="h3">Upload</Heading>
      <Image src={builderReadyUrl} alt="Builder panel ready for upload" />
      <Image src={uploadToastacugaUrl} alt="Enter your avatar details" />
      <ol>
        <li>
          from the panel click the "Build {'&'} Publish for Windows" button
        </li>
        <li>
          after a minute of building a form should appear where you can enter in
          basic information about the avatar
        </li>
        <li>click "Upload"</li>
        <li>
          after a few minutes the avatar should be visible in VRChat and other
          people can see it!
        </li>
      </ol>
    </div>
  )
}
