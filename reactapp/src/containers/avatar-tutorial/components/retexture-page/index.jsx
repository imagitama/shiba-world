import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import Button from '../../../../components/button'

import WarningMessage from '../warning-message'
import InfoMessage from '../info-message'
import Image from '../image'

import defaultViewScreenshotUrl from './assets/images/default-view-screenshot.png'
import mainMenuUrl from './assets/images/main-menu.png'
import toolsUrl from './assets/images/tools.png'
import textureSetListUrl from './assets/images/texture-set-list.png'
import layersUrl from './assets/images/layers.png'
import propertiesUrl from './assets/images/properties.png'
import shelfUrl from './assets/images/shelf.png'

import toastacugaAfterImportUrl from './assets/images/toastacuga/after-import.png'
import sketchbookAlbedoUrl from './assets/images/toastacuga/sketchbook-albedo.png'
import sketchbookNormalUrl from './assets/images/toastacuga/sketchbook-normal.png'
import importedAlbedoUrl from './assets/images/toastacuga/imported-albedo.png'
import addFillLayerUrl from './assets/images/toastacuga/add-fill-layer.png'
import appliedBodyAlbedoUrl from './assets/images/toastacuga/applied-body-albedo.png'
import selectNormalMapUrl from './assets/images/toastacuga/select-normal-map.png'
import withNormalUrl from './assets/images/toastacuga/with-normal.png'
import helloUrl from './assets/images/toastacuga/hello.png'
import exportUrl from './assets/images/toastacuga/export.png'

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
        <title>How to retexture a base model | VRCArena</title>
        <meta
          name="description"
          content="How to use Substance Painter to retexture the base model for your VRChat avatar."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Retexturing your avatar</Heading>
      </div>
      <p>
        You've downloaded your avatar and extracted the .RAR or .ZIP it comes
        with and you have a bunch of files and now you want to start customizing
        it. We recommend the very popular software Substance Painter.
      </p>
      <Heading variant="h3">
        Downloading and installing Substance Painter
      </Heading>
      <p>
        Substance Painter is a paid product however Adobe offer a free 30 day
        trial.
      </p>
      <WarningMessage message="In this tutorial we recommend you use the latest (2020) version installed via Substance Launcher." />
      <p>
        Note that Substance Painter projects can always be opened in newer
        versions of the software but can <strong>never</strong> be opened in
        older versions.
      </p>
      <Button url="https://www.substance3d.com/products/substance-painter">
        Visit the website
      </Button>
      <Heading variant="h3">How does Substance Painter work?</Heading>
      <p>
        SP is similar to other image editing software such as Photoshop. When
        you open the software you will see various panels and toolbars,
        explained below:
      </p>
      <Image src={defaultViewScreenshotUrl} alt="Default view screenshot" />
      <Heading variant="h4">Main Menu</Heading>
      <Image src={mainMenuUrl} alt="Main menu screenshot" />
      <p>
        This is the main menu. Use it to import 3D models, export textures and
        configure your project.
      </p>
      <Heading variant="h4">Tools</Heading>
      <Image src={toolsUrl} alt="Tools screenshot" />
      <p>
        These are your painting tools. Use them to draw on your 3D model. You
        will use the standard paint brush (first item) the most.
      </p>
      <Heading variant="h4">Texture Set List</Heading>
      <Image src={textureSetListUrl} alt="Texture set list screenshot" />
      <p>
        3D models are usually comprised of multiple sets of textures (for
        example a texture for the hair and one for the body). You can select
        them here.
      </p>
      <Heading variant="h4">Layers</Heading>
      <Image src={layersUrl} alt="Layers screenshot" />
      <p>
        Similar to 2D image editing software, textures can be divided up into
        layers. The final textures you export will "flatten" these layers
        together. Layers can have opacity or can blend into other layers. You
        can use folders to group similar layers together.
      </p>
      <Heading variant="h4">Properties</Heading>
      <Image src={propertiesUrl} alt="Properties screenshot" />
      <p>
        This panel lets you configure your brush, a layer and basically anything
        else in Substance Painter. You will use this a lot.
      </p>
      <Heading variant="h4">Shelf</Heading>
      <Image src={shelfUrl} alt="Shelf screenshot" />
      <p>
        The shelf is where you can select from all materials and brushes
        provided by Substance Painter or any you have imported yourself.
      </p>
      <Heading variant="h3">Importing your model</Heading>
      <InfoMessage message="If your avatar comes with a Substance Painter project file (.spp) you can skip all of these steps and open the project now." />
      <ol>
        <li>go to "File" (in the Main Menu) and click "New..."</li>
        <li>in the pop-up next to "File" click "Select..."</li>
        <li>navigate to the .fbx file of the avatar and select it</li>
        <li>in the pop-up click "OK"</li>
      </ol>
      <p>
        We imported the Toastacuga avatar from the previous page and it looked
        like this:
      </p>
      <Image
        src={toastacugaAfterImportUrl}
        alt="Toastacuga imported screenshot"
      />
      <Heading variant="h3">Textures</Heading>
      <p>
        The Toastacuga avatar comes with .psd files so we used Sketchbook to
        open the .psd and export the textures into files that Substance Painter
        understands.
      </p>

      <Heading variant="h4">Albedo maps</Heading>
      <p>
        The colored part of your texture is called an "albedo map". It is a 2D
        image that when applied to all of the polygons (triangles) of your 3D
        model it will give it color.
      </p>
      <p>
        For the Toastacuga avatar we had to turn off all layers except
        "AlbedoTransparency_Body" and export it as a PNG:
      </p>
      <Image
        src={sketchbookAlbedoUrl}
        alt="Toastacuga Sketchbook albedo layer"
      />
      <Heading variant="h4">Normal maps</Heading>
      <p>
        A normal map is a way to "fake" lighting for a 3D model without needing
        extra polygons (so it is better for performance). For example it lets
        you define muscles of a human. It is almost always a purple color.
      </p>
      <p>
        For the Toastacuga avatar we had to toggle off all layers except
        "Normalmap_Body" then export it as a PNG:
      </p>
      <Image
        src={sketchbookNormalUrl}
        alt="Toastacuga Sketchbook normal layer"
      />
      <Heading variant="h3">Import and use textures</Heading>
      <Heading variant="h4">Albedo</Heading>
      <ol>
        <li>go to "File" then "Import resources..."</li>
        <li>click "Add resources" at the top right</li>
        <li>find the .png file of the albedo texture and select it</li>
        <li>
          on the right of your file click "undefined" then select "texture"
        </li>
        <li>for "Import your resources to" select "project 'name'"</li>
        <li>click "Import"</li>
      </ol>
      <p>For the Toastacuga it then appears in our Shelf:</p>
      <Image
        src={importedAlbedoUrl}
        alt="Toastacuga imported albedo in shelf"
      />
      <p>
        Now that you have you have imported it, apply the texture using a Fill
        Layer:
      </p>
      <Image src={addFillLayerUrl} alt="Add a fill layer" />
      <ol>
        <li>
          click the "Add Fill Layer" icon (paint bucket) to add a new fill layer
          (highlighted in yellow)
        </li>
        <li>
          drag the texture from the Shelf to the "Base Color" square in the
          Properties panel (highlighted in green)
        </li>
      </ol>
      <p>It should now look like this:</p>
      <Image src={appliedBodyAlbedoUrl} alt="Applied body albedo" />
      <p>
        Note that the eyes and fur are still not colored. You need to export a
        .png for each of these parts and import them just like you did the body
        by following the same steps but select the different Texture Set.
      </p>
      <Heading variant="h4">Normal</Heading>
      <p>For the normal map you have to do something different:</p>
      <Image src={selectNormalMapUrl} alt="Select normal map" />
      <ol>
        <li>import just like you did the albedo</li>
        <li>
          on the far right click the first icon called "Texture Set Settings"
          (highlighted in yellow)
        </li>
        <li>
          under "Mesh Maps" click "Select normal map" (highlighted in green)
        </li>
        <li>select your imported normal map</li>
      </ol>
      <p>Your 3D model should now look a lot more defined:</p>
      <Image src={withNormalUrl} alt="With normal map applied" />
      <Heading variant="h2">Painting on your model</Heading>
      <Heading variant="h3">How to paint</Heading>
      <p>
        Instead of painting directly onto the model (which you can do but is not
        recommended) you should use a <strong>fill layer</strong> then apply a{' '}
        <strong>mask</strong>. A mask is just a way to tell Substance Painter
        where or where not to apply the color using black and white.
      </p>
      <p>
        For example to paint the worlds "Hello" on the chest of the Toastacuga
        you would:
      </p>
      <ol>
        <li>create a fill layer</li>
        <li>
          in the Properties for the layer click the white bar under "Base Color"
          and select a new color
        </li>
        <li>right-click the layer and click "Add black mask"</li>
        <li>click the black square in the list of layers to select the mask</li>
        <li>paint (in white) where you want it</li>
      </ol>
      <p>We wrote "Hello":</p>
      <Image src={helloUrl} alt="Hello result" />
      <Heading variant="h2">Useful keyboard and mouse controls</Heading>
      <table>
        <tbody>
          <tr>
            <td>Move</td>
            <td>Hold down ctrl and alt and drag</td>
          </tr>
          <tr>
            <td>Rotate</td>
            <td>Hold down alt and drag</td>
          </tr>
          <tr>
            <td>Zoom</td>
            <td>Alt and mouse wheel</td>
          </tr>
          <tr>
            <td>Resize brush</td>
            <td>Ctrl and drag</td>
          </tr>
        </tbody>
      </table>
      <Heading variant="h2">Tips and tricks</Heading>
      <ul>
        <li>
          quickly toggle on and off the visibility of layers and layer groups to
          find which one styles a particular body part
        </li>
      </ul>
      <Heading variant="h2">Export</Heading>
      <p>Finally in order to use the textures you must export them.</p>
      <ol>
        <li>click "File" then "Export textures..."</li>
        <li>for "Output directory" select anywhere (remember it for later)</li>
        <li>click "Export"</li>
        <li>
          a list of .png files should be shown in green which indicates it was
          successful
        </li>
      </ol>
      <Image src={exportUrl} alt="Exported Toastacuga pop-up" />
    </div>
  )
}
