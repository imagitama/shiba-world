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
        <title>Advanced | VRCArena</title>
        <meta
          name="description"
          content="More advanced topics about VRChat avatars."
        />
      </Helmet>
      <div className={classes.headings}>
        <Heading variant="h2" className={classes.heading}>
          Advanced
        </Heading>
      </div>
      <p>These topics are not recommended for first-time avatar uploaders.</p>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.quest
          )}>
          Quest compatibility
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.customGestures
          )}>
          Custom gestures
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.customExpressions
          )}>
          Custom expressions
        </Link>
      </Heading>
      <Heading variant="h3">
        <Link
          to={routes.avatarTutorialWithVar.replace(
            ':pageName',
            pageNames.shaders
          )}>
          Shaders
        </Link>
      </Heading>
    </div>
  )
}
