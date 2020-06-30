import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import WarningIcon from '@material-ui/icons/Warning'

const useStyles = makeStyles({
  root: {
    marginBottom: '2rem',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center'
  },
  icon: {
    marginRight: '0.75rem'
  }
})

export default () => {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <WarningIcon className={classes.icon} />
      <span>
        This asset is only available to members of Pikapetey's{' '}
        <a
          href="http://www.patreon.com/pikapetey"
          target="_blank"
          rel="noopener noreferrer">
          Patreon
        </a>{' '}
        and Discord. Regular participation in the server will award you the role
        needed to access the required files. If the asset author is available
        you may contact them directly with a request to download it.
      </span>
    </Paper>
  )
}
