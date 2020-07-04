import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import FileUploader from '../file-uploader'

import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import { handleError } from '../../error-handling'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'

const useStyles = makeStyles({
  container: {
    position: 'relative',
    width: '200px',
    height: '200px'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  msg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    color: '#FFF',
    padding: '0.25rem 0',
    width: '100%',
    textAlign: 'center'
  }
})

export default () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isSaving, hasSucceededOrFailed, save] = useDatabaseSave(
    CollectionNames.Users,
    user && user.id
  )

  const onDownloadUrl = async uploadedUrl => {
    try {
      await save({
        avatarUrl: uploadedUrl,
        lastModifiedBy: userDocument,
        lastModifiedAt: new Date()
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving || !user) {
    return <LoadingIndicator />
  }

  if (hasSucceededOrFailed === false) {
    return <ErrorMessage>Failed to upload your avatar</ErrorMessage>
  }

  return (
    <FileUploader
      onDownloadUrl={onDownloadUrl}
      directoryPath={`avatars/${user.id}`}>
      <div className={classes.container}>
        <img
          src={user.avatarUrl ? user.avatarUrl : defaultAvatarUrl}
          className={classes.image}
          alt="Avatar upload preview"
        />
        <div className={classes.msg}>Click to edit</div>
      </div>
    </FileUploader>
  )
}
