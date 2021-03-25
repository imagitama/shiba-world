import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import TextField from '@material-ui/core/TextField'

import {
  CollectionNames,
  ProfileFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import Button from '../button'
import FormControls from '../form-controls'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

import neosVrImageUrl from './assets/images/neosvr.webp'
import chilloutVrImageUrl from './assets/images/chilloutvr.webp'
import vrchatImageUrl from './assets/images/vrchat.webp'
import { mediaQueryForMobiles } from '../../media-queries'

const useStyles = makeStyles({
  cards: {
    display: 'flex',
    marginBottom: '2rem'
  },
  card: {
    width: '33.3%',
    // display: 'flex',
    flexDirection: 'column',
    '&:nth-child(2)': {
      margin: '0 1rem'
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      margin: 0
    }
  },
  actionArea: {
    flex: 1
  },
  image: {
    width: '100%',
    '& img': {
      width: '100%'
    }
  },
  checkbox: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: '0.5rem'
  },
  controls: {
    justifyContent: 'flex-end'
  },
  usernameInputItem: {
    padding: '0.5rem',
    opacity: 0.5,
    transition: 'all 100ms'
  },
  selected: {
    opacity: 1
  },
  usernameInput: {
    width: '100%'
  }
})

const vrPlatformNames = {
  VRCHAT: 'VRCHAT',
  CHILLOUTVR: 'CHILLOUTVR',
  NEOSVR: 'NEOSVR'
}

const vrPlatforms = [
  {
    name: vrPlatformNames.VRCHAT,
    title: 'VRChat',
    websiteUrl: 'https://hello.vrchat.com/',
    description:
      'A free-to-play massively multiplayer online virtual reality social platform created by Graham Gaylor and Jesse Joudrey.',
    imageUrl: vrchatImageUrl,
    field: ProfileFieldNames.vrchatUsername
  },
  {
    name: vrPlatformNames.CHILLOUTVR,
    title: 'ChilloutVR',
    websiteUrl: 'https://store.steampowered.com/app/661130/ChilloutVR/',
    description:
      'A free-to-play massively multiplayer online virtual reality platform created by Alpha Blend Interactive.',
    imageUrl: chilloutVrImageUrl,
    field: ProfileFieldNames.chilloutVrUsername
  },
  {
    name: vrPlatformNames.NEOSVR,
    title: 'NeosVR',
    websiteUrl: 'https://neos.com/',
    description:
      'A free-to-play massively multiplayer online virtual reality metaverse created by Solirax.',
    imageUrl: neosVrImageUrl,
    field: ProfileFieldNames.neosVrUsername
  }
]

export default ({ analyticsCategory, onDone }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Profiles,
    userId
  )

  const [selectedFields, setSelectedFields] = useState(
    vrPlatforms.reduce(
      (initialState, platform) => ({
        ...initialState,
        [platform.name]: {
          isSelected: false,
          username: ''
        }
      }),
      {}
    )
  )

  const areAnySelected = Object.values(selectedFields).find(
    field => field.isSelected
  )

  const toggleSelectPlatform = platformName => {
    setSelectedFields(currentVal => ({
      ...currentVal,
      [platformName]: {
        ...currentVal[platformName],
        isSelected: !currentVal[platformName].isSelected
      }
    }))

    trackAction(
      analyticsCategory,
      selectedFields[platformName].isSelected
        ? 'Unselect VR platform'
        : 'Select VR platform',
      platformName
    )
  }

  const setUsername = (platformName, newUsername) =>
    setSelectedFields(currentVal => ({
      ...currentVal,
      [platformName]: {
        ...currentVal[platformName],
        username: newUsername
      }
    }))

  const onSaveBtnClick = async () => {
    try {
      await save({
        [ProfileFieldNames.vrchatUsername]:
          selectedFields[vrPlatformNames.VRCHAT].username || null,
        [ProfileFieldNames.chilloutVrUsername]:
          selectedFields[vrPlatformNames.CHILLOUTVR].username || null,
        [ProfileFieldNames.neosVrUsername]:
          selectedFields[vrPlatformNames.NEOSVR].username || null,
        [ProfileFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [ProfileFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save VR platforms to db', err)
      handleError(err)
    }
  }

  return (
    <>
      <p>Select the VR games that you play (optional):</p>
      <div className={classes.cards}>
        {vrPlatforms.map(platform => (
          <Card className={classes.card}>
            <CardActionArea
              className={classes.actionArea}
              onClick={() => toggleSelectPlatform(platform.name)}>
              <div className={classes.checkbox}>
                <Checkbox checked={selectedFields[platform.name].isSelected} />
              </div>
              <div className={classes.image}>
                <img src={platform.imageUrl} />
              </div>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {platform.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {platform.description}
                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions className={classes.controls}>
              <Button
                size="small"
                color="primary"
                url={platform.websiteUrl}
                icon={<OpenInNewIcon />}
                onClick={() =>
                  trackAction(
                    analyticsCategory,
                    'Click learn more about VR platform button',
                    platform.name
                  )
                }>
                Learn More
              </Button>
            </CardActions>
          </Card>
        ))}
      </div>
      {areAnySelected && (
        <>
          <p>Enter your usernames:</p>
          <div className={classes.cards}>
            {vrPlatforms.map(platform => (
              <div className={classes.card}>
                <div
                  className={`${classes.usernameInputItem} ${
                    selectedFields[platform.name].isSelected
                      ? classes.selected
                      : ''
                  }`}>
                  <TextField
                    value={selectedFields[platform.name].username}
                    label="Username"
                    variant="outlined"
                    onChange={event =>
                      setUsername(platform.name, event.target.value)
                    }
                    className={classes.usernameInput}
                    disabled={!selectedFields[platform.name].isSelected}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <FormControls>
        <Button onClick={() => onSaveBtnClick()} isDisabled={isSaving}>
          Save
        </Button>
        {isSaving
          ? 'Saving...'
          : isSaveSuccess
          ? ' Saved!'
          : isSaveErrored
          ? ' Error'
          : ''}
      </FormControls>
    </>
  )
}
