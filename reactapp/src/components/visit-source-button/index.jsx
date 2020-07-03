import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'

import { trackAction, actions } from '../../analytics'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
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
  const [assetDocument] = useDatabaseDocument(CollectionNames.Assets, assetId)
  const userId = useFirebaseUserId()
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)
  const [, , saveToDatabase] = useDatabaseSave(CollectionNames.Downloads)

  const onBtnClick = () => {
    trackAction(actions.VISIT_SOURCE, {
      assetId,
      sourceUrl
    })

    if (isNoFilesAttached) {
      saveToDatabase({
        asset: assetDocument,
        visitSource: true,
        createdBy: userDocument,
        createdAt: new Date()
      })
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
