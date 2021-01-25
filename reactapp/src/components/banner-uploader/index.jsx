import React from 'react'
import shortid from 'shortid'

import { BANNER_WIDTH, BANNER_HEIGHT } from '../../config'
import { paths } from '../../config'

import OptimizedImageUploader from '../optimized-image-uploader'

export default props => (
  <OptimizedImageUploader
    requiredWidth={BANNER_WIDTH}
    requiredHeight={BANNER_HEIGHT}
    directoryPath={paths.assetBannerDir}
    filePrefix={shortid.generate()}
    {...props}
  />
)
