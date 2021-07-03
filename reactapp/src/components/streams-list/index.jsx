import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import StreamsListItem from '../streams-list-item'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'

const useStyles = makeStyles({
  items: {
    display: 'flex',
    marginTop: '2rem',
    flexWrap: 'wrap',
    '& > *': {
      width: '33.3%',
      [mediaQueryForTabletsOrBelow]: {
        width: '50%'
      },
      [mediaQueryForMobiles]: {
        width: '100%'
      }
    }
  }
})

export default ({ profilesWithUsers }) => {
  const classes = useStyles()
  return (
    <div className={classes.items}>
      {profilesWithUsers.map(item => (
        <StreamsListItem key={item.id} {...item} />
      ))}
    </div>
  )
}
