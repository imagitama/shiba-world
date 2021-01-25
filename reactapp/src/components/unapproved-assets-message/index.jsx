import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 2),
    marginBottom: '1rem'
  }
}))

function isUserStaff(user) {
  return user.isAdmin || user.isEditor
}

export default () => {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  let [, , results] = useDatabaseQuery(CollectionNames.Assets, [
    [AssetFieldNames.isApproved, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ])

  if (!user || !isUserStaff(user) || !results || !results.length) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      There are {results ? results.length : '-'} assets waiting to be approved.
      Click <Link to={routes.admin}>here</Link> to approve (via tab).
    </Paper>
  )
}
