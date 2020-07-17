import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import ReactTwitchEmbedVideo from 'react-twitch-embed-video'

import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  root: {
    width: '50%',
    flexShrink: 1
  }
})

export default ({ twitchUsername }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <LazyLoad>
        <ReactTwitchEmbedVideo
          channel={twitchUsername}
          targetId={`twitch-embed-${twitchUsername}`}
          width="100%"
          layout="video"
          onPlay={() =>
            trackAction('Streams', 'Click play stream button', twitchUsername)
          }
        />
      </LazyLoad>
    </div>
  )
}
