import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'

import Image from '../image'
import WarningMessage from '../warning-message'
import InfoMessage from '../info-message'

import defaultMenuUrl from './assets/images/default-menu.png'
import defaultParamsListUrl from './assets/images/default-parameters-list.png'
import isHatVisibleVrcParamUrl from './assets/images/is-hat-visible-vrc-param.png'
import vrcAvatarDescriptorExpressionsUrl from './assets/images/vrc-avatar-descriptor-expressions.png'
import menuWithToggleUrl from './assets/images/menu-with-toggle.png'
import addParameterUrl from './assets/images/add-parameter.png'
import paramsListWithIsHatVisibleUrl from './assets/images/params-list-with-is-hat-visible.png'
import vrcExpressionsMenuUrl from './assets/images/vrc-expressions-menu.png'
import vrcAvatarDescriptorWithLayersUrl from './assets/images/vrc-avatar-descriptor-with-layers.png'

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
        <title>Custom expressions | VRCArena</title>
        <meta
          name="description"
          content="How to add custom expressions to the Expressions menu to your VRChat avatar."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Custom expressions</Heading>
      </div>
      <Image
        src={vrcExpressionsMenuUrl}
        alt="A custom VRChat expressions menu"
      />
      <p>
        Expressions work similarly to gestures however how they are activated is
        from the VRChat Expressions menu.
      </p>
      <Heading variant="h3">Create the menu</Heading>
      <Image src={defaultMenuUrl} alt="Default VRChat menu" />
      <ol>
        <li>
          in the Project panel make a new folder called "My Expressions Menus"
        </li>
        <li>
          right click it and go to "Create" then "VRChat" then "Avatars" then
          click "Expressions Menu"
        </li>
        <li>rename it to something like "My Menu"</li>
      </ol>
      <WarningMessage message="Do not try to create the menu yet - you need to define the parameters first." />
      <Heading variant="h3">Create the parameters list</Heading>
      <Image src={defaultParamsListUrl} alt="Default parameters list" />
      <p>
        VRChat requires that you define what parameters you want to take from
        the menu and pass to your animator controller.
      </p>
      <ol>
        <li>in the Project panel go to the "My Expressions Menus" folder</li>
        <li>
          right click it and go to "Create" then "VRChat" then "Avatars" then
          click "Expression Parameters"
        </li>
        <li>rename it to something like "My Parameters"</li>
      </ol>
      <Heading variant="h3">Add parameters</Heading>
      <Image src={isHatVisibleVrcParamUrl} alt="A new parameter" />
      <p>
        Add any parameters your animator controller requires. For this example
        we will add a "IsHatVisible" parameter and set it to "bool" because it
        can be yes or no (see below).
      </p>
      <Heading variant="h4">Booleans</Heading>
      <p>
        A boolean can be 2 different states: yes or no. Use it to toggle
        accessories.
      </p>
      <Heading variant="h4">Floats</Heading>
      <p>
        A float is a number with decimal points. It is usually 0.0 to 1.0. It is
        usually used to indicate percentages.
      </p>
      <Heading variant="h4">Integers (Int)</Heading>
      <p>
        An integer is a whole number. It is usually used to indicate one of
        multiple options.
      </p>
      <Heading variant="h4">Memory usage</Heading>
      <p>
        VRChat limits the number of parameters you can use for performance
        reasons. You shouldn't need to worry about this unless your avatar has a
        lot of parameters.
      </p>
      <Heading variant="h3">Add menu and parameters to VRChat avatar</Heading>
      <Image
        src={vrcAvatarDescriptorExpressionsUrl}
        alt="Expressions menu and parameters fields"
      />
      <p>
        Now that we have our menu and parameters defined you need to add them to
        the VRChat avatar:
      </p>
      <ol>
        <li>inspect the avatar in the Hierarchy panel</li>
        <li>
          go to the "VRC Avatar Descriptor" component and expand "Expressions"
        </li>
        <li>next to "Menu" search for the menu you created</li>
        <li>next to "Parameters" search for the parameters you created</li>
      </ol>
      <Heading variant="h3">Build menu</Heading>
      <Image src={menuWithToggleUrl} alt="Menu with toggle" />
      <p>Finally you can actually build the menu:</p>
      <ol>
        <li>inspect the Menu you created</li>
        <li>click "Add Control"</li>
        <li>give it a name which is shown in-game</li>
        <li>optionally set an icon</li>
        <li>
          change the "Type" to whatever you want (in this example we are
          toggling an object so set it to "Toggle")
        </li>
        <li>
          for "Parameter" select our newly created parameter "IsHatVisible"
        </li>
      </ol>
      <Heading variant="h3">Create FX layer</Heading>
      <Image src={addParameterUrl} alt="Add a new parameter" />
      <Image
        src={paramsListWithIsHatVisibleUrl}
        alt="Our custom parameter in the list"
      />
      <p>
        VRChat will now display a toggle button in the expressions menu and will
        pass your parameter to your animator controller but you don't have any
        controller yet.
      </p>
      <ol>
        <li>
          in your Project panel create a new "animator controller" called "My
          FX" or something meaningful
        </li>
        <li>inspect it and go to the "Parameters" tab</li>
        <li>
          add a new parameter that matches your parameter in your Menu (we added
          a boolean) and make sure it is the same name
        </li>
        <li>
          return to the "Layers" tab and add a layer with states with conditions
          that check your new parameter
        </li>
        <li>inspect your avatar in the Hierarchy panel</li>
        <li>go to "VRC Avatar Descriptor" and expand "Playable Layers"</li>
        <li>
          for "FX" click "Default Non-Transform" and click the black dot to
          search for your new controller
        </li>
      </ol>
      <Image
        src={vrcAvatarDescriptorWithLayersUrl}
        alt="VRC Avatar Descriptor with a custom gestures and FX layer"
      />
      <InfoMessage message="Go back to the Custom Gestures page for an example of layers and conditions for toggling an object." />
      <Heading variant="h3">Done</Heading>
      <p>
        Upload or test your VRChat avatar and open your Expressions menu. When
        you activate your menu option it should pass a new parameter to your
        animator controller which causes your state to change (in our case it
        togges our hat).
      </p>
      <p>More topics to cover in the future:</p>
      <ul>
        <li>sub-menus</li>
        <li>setting icons</li>
        <li>radial/two-axis/four-axis puppets</li>
      </ul>
    </div>
  )
}
