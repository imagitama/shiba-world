import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import shortid from 'shortid'

import FileUploader from '../../../file-uploader'
import VideoPlayer from '../../../video-player'
import Button from '../../../button'
import {
  isUrlAnImage,
  isUrlAVideo,
  getFilenameFromUrl
} from '../../../../utils'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../../../config'

const useStyles = makeStyles({
  item: { margin: '0 0 1rem 0', padding: '2rem' },
  uploader: { padding: '2rem' },
  image: {
    maxWidth: THUMBNAIL_WIDTH,
    maxHeight: THUMBNAIL_HEIGHT
  }
})

const FileAttacherItem = ({ url, onRemove, onMoveUp, onMoveDown }) => {
  const classes = useStyles()
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
      <Button color="default" onClick={onMoveUp}>
        Move Up
      </Button>
      <Button color="default" onClick={onMoveDown}>
        Move Down
      </Button>
      <Button color="default" onClick={onRemove}>
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

export default ({
  fileUrls,
  onFileAttached,
  onFileRemoved,
  onFilesChanged
}) => {
  const classes = useStyles()

  const moveFileUp = url => {
    const originalIndex = fileUrls.indexOf(url)

    if (originalIndex === 0) {
      return
    }

    onFilesChanged(moveItemInArray(originalIndex, originalIndex - 1, fileUrls))
  }

  const moveFileDown = url => {
    const originalIndex = fileUrls.indexOf(url)

    if (originalIndex === fileUrls.length - 1) {
      return
    }

    onFilesChanged(moveItemInArray(originalIndex, originalIndex + 1, fileUrls))
  }

  return (
    <>
      {fileUrls.map(fileUrl => (
        <FileAttacherItem
          key={fileUrl}
          url={fileUrl}
          onRemove={() => onFileRemoved(fileUrl)}
          onMoveUp={() => moveFileUp(fileUrl)}
          onMoveDown={() => moveFileDown(fileUrl)}
        />
      ))}
      <Paper className={classes.uploader}>
        <FileUploader
          directoryPath="asset-uploads"
          filePrefix={shortid.generate()}
          onDownloadUrl={url => onFileAttached(url)}
        />
      </Paper>
    </>
  )
}
