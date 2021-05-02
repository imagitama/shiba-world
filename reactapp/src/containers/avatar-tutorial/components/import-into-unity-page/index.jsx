import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import Button from '../../../../components/button'

import Image from '../image'
import InfoMessage from '../info-message'
import WarningMessage from '../warning-message'

import defaultProjectUrl from './assets/images/default-project.png'
import hierarchyPanelUrl from './assets/images/hierarchy-panel.png'
import gamePanelUrl from './assets/images/game-panel.png'
import scenePanelUrl from './assets/images/scene-panel.png'
import projectPanelUrl from './assets/images/project-panel.png'
import inspectorBreakdownUrl from './assets/images/inspector-breakdown.png'
import toolsUrl from './assets/images/tools.png'
import toolbarUrl from './assets/images/toolbar.png'
import importVrchatSdkUrl from './assets/images/import-vrchat-sdk.png'

import importToastacugaUrl from './assets/images/toastacuga/import-toastacuga.png'
import insertedIntoSceneUrl from './assets/images/toastacuga/inserted-into-scene.png'
import importedTexturesUrl from './assets/images/toastacuga/imported-textures.png'
import bodyMaterialBreakdownUrl from './assets/images/toastacuga/body-material-breakdown.png'
import selectTextureUrl from './assets/images/toastacuga/select-texture.png'
import appliedTextureUrl from './assets/images/toastacuga/applied-texture.png'

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
        <title>
          Import your avatar and textures into Unity for uploading | VRCArena
        </title>
        <meta
          name="description"
          content="How to import your avatar and textures into Unity for uploading it into VRChat."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Import into Unity</Heading>
      </div>
      <Heading variant="h3">Install Unity</Heading>
      <p>Download and install Unity 2018.4.20f1 using Unity Hub.</p>
      <Button url="https://unity3d.com/get-unity/download">
        Download from website
      </Button>
      <Heading variant="h3">Create project</Heading>
      <p>
        Create a new Unity project and open it. It should look something like
        this:
      </p>
      <Image src={defaultProjectUrl} alt="Default Unity project" />
      <Heading variant="h4">Window toolbar</Heading>
      <Image src={toolbarUrl} alt="Toolbar" />
      <p>
        Shows you basic information about your Unity project as well as buttons
        to change your project.
      </p>
      <Heading variant="h4">Tools</Heading>
      <Image src={toolsUrl} alt="Tools" />
      <p>
        A collection of tools to manipulate objects in your scene. Move, rotate
        and scale are the most common.
      </p>
      <Heading variant="h4">Scene</Heading>
      <Image src={scenePanelUrl} alt="Scene panel" />
      <p>
        Avatars and worlds in VRChat exist inside a "scene" which is simply a
        collection of objects that are independent from each other except for
        the assets that they use from your project.
      </p>
      <p>
        A single Unity project can have as many scenes as you like with each
        scene being an independent VRChat avatar that shares the same
        accessories.
      </p>
      <InfoMessage message="Click the sun icon to toggle lighting." />
      <Heading variant="h4">Hierarchy</Heading>
      <Image src={hierarchyPanelUrl} alt="Hierarchy panel" />
      <p>
        These are the objects inside your scene. An object can have only one
        parent but can have many children. Objects with a parent will move with
        the parent (so if you put sunglasses on your "head" object the
        sunglasses move with the head).
      </p>
      <InfoMessage message="Double-click an object to focus on it." />
      <Heading variant="h4">Game</Heading>
      <Image src={gamePanelUrl} alt="Game panel" />
      <p>
        This view is usually for game development and for previewing a VRChat
        world. You can ignore this panel for your avatar.
      </p>
      <Heading variant="h4">Project</Heading>
      <Image src={projectPanelUrl} alt="Project panel" />
      <p>This shows you every asset (file) inside your project.</p>
      <Heading variant="h4">Inspector</Heading>
      <Image src={hierarchyPanelUrl} alt="Inspector panel" />
      <p>
        This panel shows you information about any object in your hierarchy or
        any asset you have clicked on from the Project panel.
      </p>
      <Heading variant="h4">Inspector</Heading>
      <Image src={inspectorBreakdownUrl} alt="Inspector panel" />
      <p>
        This panel shows you information about any object in your hierarchy or
        any asset you have clicked on from the Project panel.
      </p>
      <p>
        Game objects always have a name (blue), transform (rotation, position
        and scale - green), can be toggled off and on (red) and have a list of
        "components" that are attached to them (pink). Components can be scripts
        or a Dynamic Bone or anything (in this example it is an Animator which
        controls animation).
      </p>
      <Heading variant="h4">Other panels</Heading>
      <p>
        There are numerous other panels that might be useful for your avatar
        building at a later time.
      </p>
      <Heading variant="h3">Install VRChat SDK</Heading>
      <p>
        You must install the VRChat SDK before you start working with avatars.
      </p>
      <WarningMessage message="Select SDK3 - Avatars" />
      <Button url="https://vrchat.com/home/download">Download the SDK</Button>
      <p>
        Once you have downloaded it (it should be a .unityproject) double-click
        the file to tell Unity to import the SDK. Click "Import".
      </p>
      <Image src={importVrchatSdkUrl} alt="Import VRChat SDK pop-up" />
      <Heading variant="h3">Import Dynamic Bones</Heading>
      <p>
        Because Dynamic Bones is an asset you have to purchase from the Unity
        store, no avatar should include it.
      </p>
      <InfoMessage message="This is optional but highly recommended so that your avatar looks better." />
      <Button url="https://assetstore.unity.com/packages/tools/animation/dynamic-bone-16743">
        Buy Dynamic Bones
      </Button>
      <Heading variant="h3">Import the avatar</Heading>
      <p>
        If your avatar comes with a .unitypackage file, double-click it and
        click "Import" when prompted (like with the SDK).
      </p>
      <p>
        If your avatar comes with a .fbx file, drag and drop the file into the
        Project panel in your Unity project to import it.
      </p>
      <p>When we import the Toastacuga this is what it looks like:</p>
      <Image src={importToastacugaUrl} alt="Import Toastacuga pop-up" />
      <Heading variant="h3">Insert into scene</Heading>
      <p>
        If your avatar comes with a scene (check the "Scenes" folder in the
        Project panel) double-click it to load it.
      </p>
      <p>
        Otherwise find the .fbx file in the Project panel and drag it anywhere
        into the Hierarchy panel. This inserts into the scene.
      </p>
      <p>This is what our scene looks like when we import the Toastacuga:</p>
      <Image src={insertedIntoSceneUrl} alt="Inserted Toastacuga into scene" />
      <Heading variant="h3">Import textures</Heading>
      <p>
        We need to import the textures you exported from Substance Painter.
        Simply drag and drop all of the .png files into a folder inside your
        project (give it the name "My Textures" to help you later).
      </p>
      <p>These are the textures for the Toastacuga:</p>
      <Image src={importedTexturesUrl} alt="Imported Toastacuga textures" />
      <Heading variant="h3">Create materials</Heading>
      <p>
        A material in Unity is a collection of textures - your albedo map,
        normal map and a bunch of other maps - that can be applied to a specific
        kinds of game objects.
      </p>
      <p>
        You should create a material per texture set that you exported from
        Substance Painter. For example the Toastacuga has body, eyes, eye
        exterior and fur.
      </p>
      <ol>
        <li>create a folder in your Project panel called "My Materials"</li>
        <li>
          right click the folder and hover over "Create" then click "Material"
        </li>
        <li>
          give it a name that corresponds to the textured object (such as "body"
          or "eyes")
        </li>
        <li>repeat for each textured object</li>
      </ol>
      <p>This is the material for the body part of the Toastacuga:</p>
      <Image src={bodyMaterialBreakdownUrl} alt="Body material breakdown" />
      <table>
        <tbody>
          <tr>
            <td>Blue</td>
            <td>Albedo map</td>
          </tr>
          <tr>
            <td>Red</td>
            <td>Normal map</td>
          </tr>
          <tr>
            <td>Green</td>
            <td>Adjust how shiny the material is</td>
          </tr>
        </tbody>
      </table>
      <p>
        Click the black dot next to the text label to open up the browser and
        select the .png file that corresponds to the textured object:
      </p>
      <Image src={selectTextureUrl} alt="Select texture for material" />
      <Heading variant="h3">Apply materials</Heading>
      <p>
        Once you have your material simply drag it over the object you want to
        apply it to in your scene. It should immediately appear:
      </p>
      <Image src={appliedTextureUrl} alt="Applied body material" />
      <InfoMessage
        message={`It might change lighting because some avatars come with a different kind of "shader" which changes the appearance however that is an advanced topic for a later time.`}
      />
      <Heading variant="h3">Upload</Heading>
      <p>The next step is uploading your avatar.</p>
    </div>
  )
}
