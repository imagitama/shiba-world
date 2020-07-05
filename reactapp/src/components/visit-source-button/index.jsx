import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'

import { trackAction, actions } from '../../analytics'
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

export default ({
  assetId,
  sourceUrl,
  isNoFilesAttached = false,
  isLarge = false
}) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [, , , saveToDatabase] = useDatabaseSave(CollectionNames.Downloads)

  const onBtnClick = async () => {
    try {
      trackAction(actions.VISIT_SOURCE, {
        assetId,
        sourceUrl
      })

      // If files are attached a different download button should be shown
      // so we dont want to double-up on tracking
      if (isNoFilesAttached) {
        await saveToDatabase({
          asset: createRef(CollectionNames.Assets, assetId),
          visitSource: true,
          createdBy: createRef(CollectionNames.Users, userId),
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
      size={isLarge ? 'large' : ''}
      className={isLarge ? classes.large : ''}>
      Visit Source
    </Button>
  )
}
