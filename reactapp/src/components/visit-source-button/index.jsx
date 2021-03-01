import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

const useStyles = makeStyles({
  large: {
    width: '100%'
  }
})

function isVrchatAvatarUrl(url) {
  return url && url.includes('vrchat.com/home/avatar')
}

function isVrchatWorldUrl(url) {
  return (
    url &&
    (url.includes('vrchat.com/home/world') ||
      url.includes('vrchat.com/home/launch?worldId'))
  )
}

function isGumroadUrl(url) {
  return url && url.includes('gumroad.com')
}

function isTwitterUrl(url) {
  return url && url.includes('twitter.com')
}

function isPatreonUrl(url) {
  return url && url.includes('patreon.com')
}

function isDiscordUrl(url) {
  return url && (url.includes('discordapp.com') || url.includes('discord.com'))
}

function getButtonLabel(category, sourceUrl, isNoFilesAttached) {
  if (!isNoFilesAttached) {
    return 'Visit Source'
  }

  if (isGumroadUrl(sourceUrl)) {
    return 'Visit Gumroad source'
  }

  if (isTwitterUrl(sourceUrl)) {
    return 'View Source Tweet'
  }

  if (isVrchatAvatarUrl(sourceUrl)) {
    return 'View VRChat Avatar'
  }

  if (isVrchatWorldUrl(sourceUrl)) {
    return 'View VRChat World'
  }

  if (isPatreonUrl(sourceUrl)) {
    return 'Go to Patreon source'
  }

  if (isDiscordUrl(sourceUrl)) {
    return 'Go to Discord source'
  }

  return 'Visit Source'
}

export default ({
  assetId,
  sourceUrl,
  categoryName,
  isNoFilesAttached = false,
  isLarge = false,
  onClick = null
}) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [, , , saveToDatabase] = useDatabaseSave(CollectionNames.Downloads)

  const onBtnClick = async () => {
    try {
      if (onClick) {
        onClick({
          assetId,
          sourceUrl
        })
      }

      // If files are attached a different download button should be shown
      // so we dont want to double-up on tracking
      if (isNoFilesAttached) {
        await saveToDatabase({
          asset: createRef(CollectionNames.Assets, assetId),
          visitSource: true,
          createdBy: userId ? createRef(CollectionNames.Users, userId) : null,
          createdAt: new Date()
        })
      }
    } catch (err) {
      console.error('Failed to save to database', err)
      handleError(err)
    }
  }

  return (
    <Button
      color={isNoFilesAttached ? 'primary' : 'default'}
      url={sourceUrl}
      icon={<LaunchIcon />}
      onClick={onBtnClick}
      size={isLarge ? 'large' : undefined}
      className={isLarge ? classes.large : ''}>
      {getButtonLabel(categoryName, sourceUrl, isNoFilesAttached)}
    </Button>
  )
}
