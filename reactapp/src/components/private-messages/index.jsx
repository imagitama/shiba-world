import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PrivateMessagesItem from '../private-messages-item'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  root: {
    margin: '0 auto',
    width: '50%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  }
})

export default ({ messages }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      {messages.map(message => (
        <PrivateMessagesItem key={message.id} message={message} />
      ))}
    </div>
  )
}
