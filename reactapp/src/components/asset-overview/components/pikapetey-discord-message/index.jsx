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

const shibaInuBaseModelUrl =
  'https://www.vrcarena.com/assets/sLtMXTewSFWGvmJ8WST8'

export default () => {
  const classes = useStyles()

  return (
    <Paper className={classes.root}>
      <WarningIcon className={classes.icon} />
      <span>
        This asset is only available to Pikapetey Patreons that have the Member
        role in his Discord. If you are not a member you may need to contact the
        original author of the asset or contact staff of the Discord server for
        more info. <Link to={shibaInuBaseModelUrl}>Click here</Link> to view the
        Pikapetey base model.
      </span>
    </Paper>
  )
}
