import React from 'react'
import ReactPlayer from 'react-player'

export default ({ url, onPlay = null }) => (
  <ReactPlayer
    url={url}
    controls
    onPlay={() => {
      if (onPlay) {
        onPlay()
      }
    }}
  />
)
