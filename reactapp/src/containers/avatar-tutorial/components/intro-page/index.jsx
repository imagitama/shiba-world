import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import Heading from '../../../../components/heading'

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
        <title>Introduction to uploading avatars for VRChat | VRCArena</title>
        <meta
          name="description"
          content="An introduction into the process of uploading your avatar into VRChat."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Introduction</Heading>
      </div>
      <p>
        So you want to create your first VRChat avatar. You want an avatar that
        is <em>you</em> or maybe you want to create an avatar that other people
        can clone and share. This tutorial is for you.
      </p>
      <Heading variant="h3">Difficulty</Heading>
      <p>
        This tutorial assumes that you know to install and use software that you
        download from websites. It does not assume you know how 3D models work
        (but it is nice to have).
      </p>
      <Heading variant="h3">How this tutorial is structured</Heading>
      <p>
        We will pick an avatar from this website, download it, customize the
        texture, import it into Unity and upload it to VRChat. More advanced
        topics (Quest compatibility, custom animations, etc.) will come later.
      </p>
      <Heading variant="h3">Glossary</Heading>
      <Heading variant="h4">3D model</Heading>
      <p>
        An object that is displayed on your computer made of thousands of
        triangles called "polygons".
      </p>
      <Heading variant="h4">Textures</Heading>
      <p>
        2D images that when applied to a 3D model will change the appearance of
        them. Textures are commonly sub-divided into at least:
      </p>
      <ul>
        <li>albedo maps: the texture without any shadows or highlghts</li>
        <li>
          normal maps: a way to "fake" lighting in a video game (generally a
          purple colored 2D image)
        </li>
      </ul>
      <Heading variant="h4">Unity</Heading>
      <p>
        Unity is a popular game engine that VRChat is written with. You will use
        Unity to upload your avatar from your PC and to customize it with your
        textures and custom animations.
      </p>
      <Heading variant="h4">Substance Painter</Heading>
      <p>
        A popular texturing software similar to Photoshop but for 3D modelling.
        You will use it to change the appearance of your avatar.
      </p>
      <Heading variant="h4">Blender</Heading>
      <p>
        A popular 3D modelling tool. You will not be using it in this tutorial
        (covered in the "Advanced" section).
      </p>
      <Heading variant="h4">Bone</Heading>
      <p>
        The 3D models that avatars use have a "skeleton" (or "armature") with
        "bones" that tell Unity how to move the polygons when the player's arm
        and legs move.
      </p>
      <Heading variant="h4">Rigging</Heading>
      <p>The act of adding bones to a 3D model.</p>
    </div>
  )
}
