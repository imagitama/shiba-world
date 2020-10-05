import React from 'react'
import { THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT } from '../../config'

export default ({ url, className }) => (
  <img
    src={url}
    width={THUMBNAIL_WIDTH}
    height={THUMBNAIL_HEIGHT}
    alt="Thumbnail for asset"
    className={className}
  />
)
