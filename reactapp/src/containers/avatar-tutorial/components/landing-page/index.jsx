import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import Heading from '../../../../components/heading'
import * as routes from '../../../../routes'
import { pageNames } from '../../config'

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
        <title>Avatar Tutorial | VRCArena</title>
        <meta
          name="description"
          content="A tutorial for how to create and upload your first VRChat avatar using a pre-made base model."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2">Table of Contents</Heading>
      </div>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.intro
          )}>
          1. Introduction
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.pickYourAvatar
          )}>
          2. Pick your avatar
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.retexture
          )}>
          3. Re-texture
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.importIntoUnity
          )}>
          4. Import into Unity
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.upload
          )}>
          5. Upload
        </Link>
      </Heading>
    </div>
  )
}
