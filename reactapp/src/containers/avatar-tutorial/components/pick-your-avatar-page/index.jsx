import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import Heading from '../../../../components/heading'
import Button from '../../../../components/button'
import * as routes from '../../../../routes'
import { AssetCategories } from '../../../../hooks/useDatabaseQuery'

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
        <title>Picking your VRChat avatar base model | VRCArena</title>
        <meta
          name="description"
          content="How to select a base model for your next VRChat avatar."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Pick your avatar</Heading>
      </div>
      <p>
        Generally when you decide to upload your own VRChat avatar you have an
        idea for what your avatar will look like or you might have liked someone
        else's model and you want to use that as a foundation.
      </p>
      <Heading variant="h3">Finding an avatar</Heading>
      <p>
        Visit the Avatars page on this site to discover a huge list (over 600)
        of avatars to choose from. Some are paid (you purchase the 3D model and
        a base texture from a site such as Gumroad) or free (from Gumroad or
        some other file hosting site).
      </p>
      <Button
        url={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.avatar
        )}
        icon={<ChevronRightIcon />}>
        Browse avatars
      </Button>
      <Heading variant="h3">What an avatar comes with</Heading>
      <p>
        Depending on which avatar you chose, an avatar comes with various files
        so you can customize it and upload it to VRChat:
      </p>
      <ul>
        <li>a .unitypackage that contains the 3D model OR</li>
        <li>a .fbx file that contains the 3D model</li>
        <li>a Substance Painter file OR</li>
        <li>a Photoshop file OR</li>
        <li>multiple individual .png files (named albedo, normal, etc.)</li>
        <li>alternate versions (such as a Quest version)</li>
      </ul>
      <Heading variant="h3">An example avatar</Heading>
      <p>
        For this tutorial we will download a free VRChat avatar called{' '}
        <strong>Toastacuga</strong> - a fantasy creature from the game Monster
        Hunter. You can download it by clicking the button below and clicking
        View Source (you will need to be logged in to Twitter):
      </p>
      <Button
        url={routes.viewAssetWithVar.replace(
          ':assetId',
          'ZszLGtc5sBnfI37nbes1'
        )}
        icon={<ChevronRightIcon />}>
        View Toastacuga
      </Button>
      <p>
        This avatar (~200mb) includes a .unitypackage file, an .fbx file and
        .psd files for the textures.
      </p>
    </div>
  )
}
