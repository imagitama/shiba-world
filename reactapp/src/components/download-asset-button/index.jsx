import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'

import { trackAction, actions } from '../../analytics'
import { createRef } from '../../utils'
import { handleError } from '../../error-handling'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

const useStyles = makeStyles({
  // TODO: Re-use between view-source-btn
  large: {
    width: '100%'
  }
})

export default ({ assetId, url, isLarge = false }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [, , , saveToDatabase] = useDatabaseSave(CollectionNames.Downloads)

  const onDownloadBtnClick = async () => {
    trackAction(actions.DOWNLOAD_ASSET, {
      assetId,
      url
    })

    try {
      await saveToDatabase({
        asset: createRef(CollectionNames.Assets, assetId),
        createdBy: userId ? createRef(CollectionNames.Users, userId) : null,
        createdAt: new Date()
      })
    } catch (err) {
      console.error('Failed to save download to db', err)
      handleError(err)
    }
  }

  return (
    <Button
      className={`${classes.root} ${isLarge ? classes.large : ''}`}
      url={url}
      icon={<GetAppIcon />}
      onClick={onDownloadBtnClick}
      size={isLarge ? 'large' : ''}>
      Download
    </Button>
  )
}
