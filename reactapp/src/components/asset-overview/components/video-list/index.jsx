import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import VideoPlayer from '../../../video-player'
import { trackAction } from '../../../../analytics'

const useStyles = makeStyles({
  video: {
    width: '480px',
    height: '320px',
    margin: '0 0.5rem 0.5rem 0',
    background: 'rgba(0, 0, 0, 0.2)'
  }
})

const analyticsCategoryName = 'ViewAsset'

export default ({ assetId, urls }) => {
  const classes = useStyles()

  return (
    <div>
      {urls.map(url => (
        <div key={url} className={classes.video}>
          <VideoPlayer
            url={url}
            onPlay={() =>
              trackAction(analyticsCategoryName, 'Play attached video', {
                assetId,
                url
              })
            }
            width={480}
            height={320}
          />
        </div>
      ))}
    </div>
  )
}
