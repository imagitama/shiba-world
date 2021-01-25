import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import shortid from 'shortid'
import SaveIcon from '@material-ui/icons/Save'
import ImageIcon from '@material-ui/icons/Image'
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile'
import DeleteIcon from '@material-ui/icons/Delete'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'

import { isUrlAnImage, isUrlAVideo, getFilenameFromUrl } from '../../utils'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import FileUploader from '../file-uploader'
import VideoPlayer from '../video-player'
import LoadingIndicator from '../loading-indicator'
import Button from '../button'
import ErrorMessage from '../error-message'
import OptimizedImageUploader from '../optimized-image-uploader'

const useStyles = makeStyles({
  item: { margin: '0 0 1rem 0', padding: '2rem' },
  uploader: { padding: '2rem' },
  image: {
    maxWidth: THUMBNAIL_WIDTH,
    maxHeight: THUMBNAIL_HEIGHT
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  }
})

const FileAttacherItem = ({ urlOrUrls, onRemove, onMoveUp, onMoveDown }) => {
  const classes = useStyles()

  const url = urlOrUrls

  return (
    <Paper className={classes.item}>
      {isUrlAnImage(url) && (
        <img
          src={url}
          className={classes.image}
          alt="Preview of the attached file"
        />
      )}
      {isUrlAVideo(url) && <VideoPlayer url={url} />}
      <br />
      <a href={url} target="_blank" rel="noopener noreferrer">
        {getFilenameFromUrl(url)}
      </a>
      <br />
      <Button color="default" onClick={onMoveUp} icon={<ArrowUpwardIcon />}>
        Move Up
      </Button>{' '}
      <Button color="default" onClick={onMoveDown} icon={<ArrowDownwardIcon />}>
        Move Down
      </Button>{' '}
      <Button color="default" onClick={onRemove} icon={<DeleteIcon />}>
        Remove
      </Button>
    </Paper>
  )
}

function moveItemInArray(from, to, array) {
  const newArray = [].concat(array)
  newArray.splice(to, 0, newArray.splice(from, 1)[0])
  return newArray
}

export default ({ assetId, onDone }) => {
  const userId = useFirebaseUserId()
  const [isAttachingImage, setIsAttachingImage] = useState(null)
  const [newFileUrls, setNewFileUrls] = useState(null)
  const [isLoading, isErrored, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, , isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onFileAttached = fileUrl => {
    setNewFileUrls(newFileUrls.concat([fileUrl]))
    setIsAttachingImage(null)
  }

  const onFileRemoved = urlToFind => {
    setNewFileUrls(
      newFileUrls.filter(urlOrUrls => {
        return urlOrUrls !== urlToFind
      })
    )
  }

  useEffect(() => {
    if (!asset) {
      return
    }

    setNewFileUrls(asset[AssetFieldNames.fileUrls])
  }, [asset !== null])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isFailed) {
    return <ErrorMessage>Failed to save attachments</ErrorMessage>
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load asset</ErrorMessage>
  }

  const moveFileUp = urlToFind => {
    const originalIndex = newFileUrls.findIndex(item => {
      return item === urlToFind
    })

    if (originalIndex === 0) {
      return
    }

    setNewFileUrls(
      moveItemInArray(originalIndex, originalIndex - 1, newFileUrls)
    )
  }

  const moveFileDown = urlToFind => {
    const originalIndex = newFileUrls.findIndex(item => {
      return item === urlToFind
    })

    if (originalIndex === newFileUrls.length - 1) {
      return
    }

    setNewFileUrls(
      moveItemInArray(originalIndex, originalIndex + 1, newFileUrls)
    )
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction('ViewAsset', 'Click save asset attachments button', assetId)

      await save({
        [AssetFieldNames.fileUrls]: newFileUrls,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {newFileUrls.map(url => (
        <FileAttacherItem
          key={url}
          urlOrUrls={url}
          onRemove={() => onFileRemoved(url)}
          onMoveUp={() => moveFileUp(url)}
          onMoveDown={() => moveFileDown(url)}
        />
      ))}
      <Paper className={classes.uploader}>
        {isAttachingImage === true ? (
          <OptimizedImageUploader
            directoryPath="asset-uploads"
            filePrefix={shortid.generate()}
            onUploadedUrl={onFileAttached}
          />
        ) : isAttachingImage === false ? (
          <FileUploader
            directoryPath="asset-uploads"
            filePrefix={shortid.generate()}
            onDownloadUrl={onFileAttached}
          />
        ) : (
          <>
            <Button
              onClick={() => setIsAttachingImage(true)}
              color="default"
              icon={<ImageIcon />}>
              Attach Image
            </Button>{' '}
            <Button
              onClick={() => setIsAttachingImage(false)}
              color="default"
              icon={<InsertDriveFileIcon />}>
              Attach File
            </Button>
            <div className={classes.btns}>
              <Button onClick={onSaveBtnClick} icon={<SaveIcon />}>
                Save
              </Button>
            </div>
          </>
        )}
      </Paper>
    </>
  )
}
