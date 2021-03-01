import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Tweet } from 'react-twitter-widgets'

const useStyles = makeStyles({
  root: {
    width: '550px' // max width of twitter embed
    // '& > div': {
    //   width: 'auto !important'
    // },
    // '& > div > div': {
    //   width: 'auto !important'
    // }
  }
})

const getTweetIdFromUrl = url => url.split('/').pop()

export default ({ url }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Tweet tweetId={getTweetIdFromUrl(url)} options={{ width: '100%' }} />
    </div>
  )
}
