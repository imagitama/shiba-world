import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import TocIcon from '@material-ui/icons/Toc'

import Heading from '../../../../components/heading'
import * as routes from '../../../../routes'
import { pageNames } from '../../config'

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
        <title>Avatar Tutorial | VRCArena</title>
        <meta
          name="description"
          content="A tutorial for how to create and upload your first VRChat avatar using a pre-made base model."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2" className={classes.heading}>
          <span className={classes.icon}>
            <TocIcon />
          </span>{' '}
          Table of Contents
        </Heading>
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
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.advanced
          )}>
          6. Advanced
        </Link>
      </Heading>
      <Heading variant="h4">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.quest
          )}>
          6.1 Quest compatibility
        </Link>
      </Heading>
      <Heading variant="h4">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.customGestures
          )}>
          6.2 Custom gestures
        </Link>
      </Heading>
      <Heading variant="h4">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.customExpressions
          )}>
          6.3 Custom expressions
        </Link>
      </Heading>
      <Heading variant="h4">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.shaders
          )}>
          6.4 Shaders
        </Link>
      </Heading>
    </div>
  )
}
