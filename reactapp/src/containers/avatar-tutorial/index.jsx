import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import TocIcon from '@material-ui/icons/Toc'

import Heading from '../../components/heading'
import Button from '../../components/button'
import * as routes from '../../routes'

import IntroPage from './components/intro-page'
import LandingPage from './components/landing-page'
import PickYourAvatarPage from './components/pick-your-avatar-page'
import RetexturePage from './components/retexture-page'
import ImportIntoUnityPage from './components/import-into-unity-page'
import UploadPage from './components/upload-page'
import TutorialCompletePage from './components/tutorial-complete-page'

import { pageNames } from './config'

const useStyles = makeStyles({
  root: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  headings: {
    textAlign: 'center'
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.5)'
  },
  control: {
    width: '33.3%',
    '&:last-child': {
      textAlign: 'right'
    }
  },
  tableOfContentsBtn: {
    margin: '0 auto',
    textAlign: 'center'
  }
})

const Page = () => {
  const { pageName } = useParams()

  switch (pageName) {
    case pageNames.intro:
      return <IntroPage />
    case pageNames.pickYourAvatar:
      return <PickYourAvatarPage />
    case pageNames.retexture:
      return <RetexturePage />
    case pageNames.importIntoUnity:
      return <ImportIntoUnityPage />
    case pageNames.upload:
      return <UploadPage />
    case pageNames.tutorialComplete:
      return <TutorialCompletePage />
    default:
      return <LandingPage />
  }
}

const PageControls = () => {
  const { pageName } = useParams()
  const classes = useStyles()

  if (!pageName) {
    return null
  }

  const pageNamesAsArray = Object.values(pageNames)
  const currentPageIdx = pageNamesAsArray.findIndex(name => name === pageName)

  if (currentPageIdx === -1) {
    throw new Error('Page index out of bounds')
  }

  const prevPageName = pageNamesAsArray[currentPageIdx - 1]
  const nextPageName = pageNamesAsArray[currentPageIdx + 1]

  return (
    <div className={classes.pageControls}>
      <div className={classes.control}>
        {prevPageName && (
          <Button
            url={routes.avatarTutorialWithVar.replace(
              ':pageName',
              prevPageName
            )}
            icon={<ChevronLeftIcon style={{ marginLeft: '-5px' }} />}
            size="small"
            switchIconSide>
            Back
          </Button>
        )}
      </div>

      <div className={`${classes.control} ${classes.tableOfContentsBtn}`}>
        <Button
          url={routes.avatarTutorial}
          icon={<TocIcon />}
          size="small"
          switchIconSide>
          Table of Contents
        </Button>
      </div>
      <div className={classes.control}>
        {nextPageName && (
          <Button
            url={routes.avatarTutorialWithVar.replace(
              ':pageName',
              nextPageName
            )}
            icon={<ChevronRightIcon style={{ marginRight: '-5px' }} />}
            size="small">
            Next
          </Button>
        )}
      </div>
    </div>
  )
}

export default () => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <div className={classes.headings}>
        <Heading variant="h1">How to create a VRChat avatar</Heading>
        <p>
          The ultimate step-by-step guide for creating an avatar for VRChat. It
          explains the software you need to use and the steps required.
        </p>
        <p>
          Written by{' '}
          <Link
            to={routes.viewUserWithVar.replace(
              ':userId',
              '04D3yeAUxTMWo8MxscQImHJwtLV2'
            )}>
            PeanutBuddha
          </Link>
        </p>
      </div>
      <PageControls />
      <Page />
      <PageControls />
    </div>
  )
}
