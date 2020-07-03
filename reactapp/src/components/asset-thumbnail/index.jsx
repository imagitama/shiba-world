import React from 'react'

export default ({ url, className }) => (
  <img
    src={url}
    width="300"
    height="300"
    alt="Thumbnail for asset"
    className={className}
  />
)
