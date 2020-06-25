import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import { Link } from 'react-router-dom'
import * as routes from '../../../../routes'

const useStyles = makeStyles({
  root: {
    marginBottom: '2rem',
    padding: '1rem'
  }
})

export default ({ assetId }) => {
  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      How to report this asset:
      <ul>
        <li>
          contact a <Link to={routes.users}>staff member</Link> via social media
        </li>
        <li>
          send a tweet to <a href="https://twitter.com/VRCArena">our Twitter</a>
        </li>
        <li>send an email to contact AT vrcarena.com</li>
      </ul>
      Please include in your report:
      <ul>
        <li>
          the name or ID of the asset that you are reporting (the ID is{' '}
          {assetId})
        </li>
        <li>a reason why you are reporting</li>
      </ul>
      Common reasons for reporting:
      <ul>
        <li>typo</li>
        <li>incorrect source</li>
        <li>you own the asset and want it removed</li>
        <li>you have better images</li>
      </ul>
    </Paper>
  )
}
