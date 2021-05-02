import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
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
            pageNames.customAnimations
          )}>
          6.2 Custom gestures and emotes
        </Link>
      </Heading>
    </div>
  )
}
