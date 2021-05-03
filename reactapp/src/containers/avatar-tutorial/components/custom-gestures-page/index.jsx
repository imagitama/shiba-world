import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import Fireworks from '../../../../components/fireworks'

import Image from '../image'
import WarningMessage from '../warning-message'
import InfoMessage from '../info-message'

import emptyAnimatorControllerUrl from './assets/images/empty-animator-controller.png'
import emptyParamsListUrl from './assets/images/empty-params-list.png'
import inspectStateUrl from './assets/images/inspect-state.png'
import layersUrl from './assets/images/layers.png'
import basicStatesUrl from './assets/images/basic-states.png'
import toggleHatParamsUrl from './assets/images/toggle-hat-params.png'
import toggleHatVisibleUrl from './assets/images/toggle-hat-visible.png'
import inspectHatVisibleUrl from './assets/images/inspect-hat-visible.png'
import vrcAvatarDescriptorWithControllerUrl from './assets/images/vrc-avatar-descriptor-with-controller.png'
import templateControllerUrl from './assets/images/template-controller.png'
import templateParamsUrl from './assets/images/template-params.png'
import inspectPointUrl from './assets/images/inspect-point.png'
import toastacugaPointUrl from './assets/images/toastacuga-point.png'
import conditionsUrl from './assets/images/conditions.png'

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
        <title>Custom gestures | VRCArena</title>
        <meta
          name="description"
          content="How to add custom hand gestures to your VRChat avatar."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Custom gestures</Heading>
      </div>
      <p>
        VRChat (since SDK3) uses Unity's in-built animation system for custom
        hand gestures. It can be complex but it is very powerful.
      </p>
      <Heading variant="h3">How does Unity do animations</Heading>
      <Image
        src={emptyAnimatorControllerUrl}
        alt="A brand new empty animator controller"
      />
      <p>
        Unity has "animator controllers" which control which animation is
        currently playing for a game object (such as your avatar).
      </p>
      <p>
        Unity (and VRChat) use these controllers to check which hand gesture you
        are making (eg. a gun) and switches the currently playing animation
        (such as a surprised face) to the new face (such as an angry face).
      </p>
      <Heading variant="h4">Layers</Heading>
      <Image src={layersUrl} alt="The default layers list" />
      <p>
        A controller has "layers" so that you can play different animations at
        the same time and Unity will merge them all together.
      </p>
      <p>Click the black cog to open the properties for a layer.</p>
      <WarningMessage
        message={`Layers can have "weight" which changes how much they are merged with other layers. Change that to 1 unless you know what you are doing.`}
      />
      <WarningMessage
        message={`Layers can also have "masks" which restrict which body part the layer can modify. Usually leave this part alone unless you know what you are doing.`}
      />
      <Heading variant="h4">Parameters</Heading>
      <Image
        src={emptyParamsListUrl}
        alt="The default parameter list is empty"
      />
      <p>
        A controller will always change which animation is playing with
        parameters - yes or no, a number, etc.
      </p>
      <p>
        In-game VRChat will set a long list of parameters on your animator
        controller for you. The list is{' '}
        <a
          href="https://docs.vrchat.com/docs/animator-parameters"
          target="_blank"
          rel="noopener noreferrer">
          here
        </a>
        .
      </p>
      <Heading variant="h4">States</Heading>
      <Image src={basicStatesUrl} alt="Common states" />
      <p>
        Each layer has what's called a "state machine" which is how Unity knows
        when to switch animations. It starts at the green Entry box, moves to
        the orange default box then depending on the arrows will switch to a
        different state.
      </p>
      <p>
        This is an example of toggling a hat on or off. The default state is no
        hat (no animation) and the other state is hat visible.
      </p>
      <Image
        src={toggleHatVisibleUrl}
        alt="An example toggling visibility of a hat"
      />
      <p>
        If we inspect the "on" state we can see an animation should play (which
        should toggle the game object active):
      </p>
      <Image src={inspectHatVisibleUrl} alt={`Inspecting the "on" state`} />
      <Heading variant="h4">Transitions and conditions</Heading>
      <Image src={conditionsUrl} alt="Conditions" />
      <p>
        The white arrows inbetween states indicate a "transition" between them.
        Transitions occur when a condition is met. For example a condition could
        be you making a "gun" shape in VRChat (which VRChat gives to all
        animator controllers).
      </p>
      <p>
        The condition in the image is that the user must make a "point" gesture
        with their left hand (which is "GestureLeft" = 3).
      </p>
      <Heading variant="h3">Creating a gesture animator controller</Heading>
      <p>We recommend you use a template provided by VRChat:</p>
      <ol>
        <li>
          create a folder named "My Animator Controllers" in your Project panel
        </li>
        <li>
          navigate to VRCSDK/Examples3/Animations/Controllers and copy
          "vrc_AvatarV3HandsLayer.controller" to the folder
        </li>
        <li>rename it to "My Gestures" or something meaningful</li>
      </ol>
      <p>
        Click it once and open the Animator panel to take a look at it. Note
        that there are only 3 layers - "Base", "Left Hand" and "Right Hand".
      </p>
      <Image
        src={templateControllerUrl}
        alt={`The example animator controller from VRChat`}
      />
      <p>
        Also look at the parameters. "GestureLeft" is a number which corresponds
        to which hand gesture you are making on your left hand and
        "GestureRight" is for your right hand. "GestureLeftWeight" and
        "GestureRightWeight" is the percentage (represented as 0.0 to 1.0) you
        are holding down the trigger of your VR controller.
      </p>
      <Image
        src={templateParamsUrl}
        alt={`The example animator controller's parameters from VRChat`}
      />
      <table>
        <tbody>
          <tr>
            <td>0</td>
            <td>neutral (no gesture)</td>
          </tr>
          <tr>
            <td>1</td>
            <td>fist</td>
          </tr>
          <tr>
            <td>2</td>
            <td>hand open</td>
          </tr>
          <tr>
            <td>3</td>
            <td>finger pointing</td>
          </tr>
          <tr>
            <td>4</td>
            <td>victory (index and middle finger raised)</td>
          </tr>
          <tr>
            <td>5</td>
            <td>rock 'n' roll (index and pinky fingers raised)</td>
          </tr>
          <tr>
            <td>6</td>
            <td>gun</td>
          </tr>
          <tr>
            <td>7</td>
            <td>thumbs up</td>
          </tr>
        </tbody>
      </table>
      <Heading variant="h3">Change a gesture</Heading>
      <Image
        src={inspectPointUrl}
        alt="Inspecting the left hand point gesture"
      />
      <p>
        Now that you have your own controller already set up with the default
        gestures, you can go ahead and change a gesture's animation.
      </p>
      <ol>
        <li>click the left hand or right hand layer</li>
        <li>
          click the gesture state you want to modify (eg. "Point") to inspect it
        </li>
        <li>
          in the Inspector panel under "Motion" click the black dot and search
          for the new animation you want to play
        </li>
      </ol>
      <p>
        The Toastacuga avatar does not come with an animator controller but it
        does come with animations you can use for gestures (and are even named
        correctly):
      </p>
      <Image src={toastacugaPointUrl} alt="Toastacuga point animation" />
      <InfoMessage message="Note that each hand can have their own gestures so you should add it to the right hand layer too if you want it for both hands." />
      <Heading variant="h3">
        Add the animator controller to your VRChat avatar
      </Heading>
      <Image
        src={vrcAvatarDescriptorWithControllerUrl}
        alt="VRC Avatar Descriptor with animator controller with gestures"
      />
      <p>
        Finally you need to add the animator controller to your VRChat avatar:
      </p>
      <ol>
        <li>inspect your avatar in the Hierarchy panel</li>
        <li>go to the "VRC Avatar Descriptor" component</li>
        <li>expand "Playable Layers"</li>
        <li>next to "Gesture" click "Default Gesture"</li>
        <li>click the black dot and find your animator controller</li>
        <li>test it out in VRChat!</li>
      </ol>
    </div>
  )
}
