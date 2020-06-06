import React, { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import { makeStyles } from '@material-ui/core/styles'
import 'react-image-lightbox/style.css'

const useStyles = makeStyles({
  thumbnail: {
    maxHeight: 200,
    margin: '0 0.5rem 0.5rem 0',
    '&:hover': { cursor: 'pointer ' }
  }
})

export default ({ urls }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)
  const classes = useStyles()

  function onThumbnailClick(idx) {
    setActivePhotoIdx(idx)
    setIsOpen(true)
  }

  return (
    <div>
      {isOpen && (
        <Lightbox
          mainSrc={urls[activePhotoIdx]}
          nextSrc={urls[(activePhotoIdx + 1) % urls.length]}
          prevSrc={urls[(activePhotoIdx + urls.length - 1) % urls.length]}
          onCloseRequest={() => setIsOpen(false)}
          onMovePrevRequest={() =>
            setActivePhotoIdx((activePhotoIdx + urls.length - 1) % urls.length)
          }
          onMoveNextRequest={() =>
            setActivePhotoIdx((activePhotoIdx + 1) % urls.length)
          }
        />
      )}
      {urls.map((url, idx) => (
        <img
          key={url}
          src={url}
          onClick={() => onThumbnailClick(idx)}
          className={classes.thumbnail}
          alt="Image thumbnail"
        />
      ))}
    </div>
  )
}
