import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Helmet } from 'react-helmet'
import LaunchIcon from '@material-ui/icons/Launch'

import Heading from '../../../../components/heading'
import Button from '../../../../components/button'

import Image from '../image'

import useToonShaderUrl from './assets/images/use-toon-shader.png'

const useStyles = makeStyles({
  heading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    marginRight: '0.5rem'
  }
})

export default () => {
  const classes = useStyles()
  return (
    <div>
      <Helmet>
        <title>Shaders | VRCArena</title>
        <meta
          name="description"
          content="How to use shaders for your VRChat avatar."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2" className={classes.heading}>
          Shaders
        </Heading>
      </div>
      <p>
        A shader is a set of instructions that tells the GPU how to change the
        lighting, darkness, colors, etc. of what's in a video game.
      </p>
      <p>
        For a VRChat avatar that means changing how your avatar appears such as
        making it glow or sparkle or even rendering something in another
        player's vision.
      </p>
      <p>
        Shaders are popular for avatars because they make them look better in
        all lighting conditions.
      </p>
      <Heading variant="h3">Popular Shaders</Heading>
      <p>
        The most popular shader for VRChat avatars is the Poiyomi Toon Shader as
        it offers an extensive list of options and is free.
      </p>
      <Button
        url="https://github.com/poiyomi/PoiyomiToonShader"
        icon={<LaunchIcon />}>
        Download the shader
      </Button>
      <p>A full list of popular shaders is coming soon.</p>
      <Heading variant="h3">Using a shader</Heading>
      <Image src={useToonShaderUrl} alt="Switch to the Poiyomi Toon Shader" />
      <p>
        Switching to a different shader is usually as easy as inspecting the
        Material and clicking the dropdown menu for "Shader" (such as in the
        image above).
      </p>
    </div>
  )
}
