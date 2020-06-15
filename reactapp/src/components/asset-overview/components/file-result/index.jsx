import React, { useState } from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import GetAppIcon from '@material-ui/icons/GetApp'

import Button from '../../../button'
import VideoPlayer from '../../../video-player'
import FbxViewer from '../../../fbx-viewer'
import { trackAction, actions } from '../../../../analytics'
import {
  getFilenameFromUrl,
  isUrlAnImage,
  isUrlAVideo,
  isUrlAFbx
} from '../../../../utils'

const useStyles = makeStyles({
  root: { padding: '1rem', marginBottom: '1rem' },
  imageThumbnail: { width: '100%', maxWidth: '500px' }
})

export default ({ assetId, url }) => {
  const classes = useStyles()
  const [showFbxViewer, setShowFbxViewer] = useState(false)

  const onDownloadBtnClick = () =>
    trackAction(actions.DOWNLOAD_ASSET_FILE, {
      assetId,
      url
    })

  return (
    <Paper className={classes.root}>
      {getFilenameFromUrl(url)}
      <br />
      {isUrlAnImage(url) ? (
        <img
          src={url}
          className={classes.imageThumbnail}
          alt="Thumbnail for file"
        />
      ) : isUrlAVideo(url) ? (
        <VideoPlayer url={url} />
      ) : (
        <>
          {isUrlAFbx(url) && showFbxViewer && <FbxViewer url={url} />}
          {isUrlAFbx(url) && !showFbxViewer && (
            <>
              <Button onClick={() => setShowFbxViewer(true)} color="default">
                Preview .fbx
              </Button>{' '}
            </>
          )}
          <Button
            className={classes.downloadButton}
            url={url}
            icon={<GetAppIcon />}
            onClick={onDownloadBtnClick}>
            Download
          </Button>
        </>
      )}
    </Paper>
  )
}
