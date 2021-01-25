import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  Operators,
  AssetAmendmentFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(2, 2),
    marginBottom: '1rem'
  }
}))

function isUserStaff(user) {
  return user && (user.isAdmin || user.isEditor)
}

export default () => {
  const [, , user] = useUserRecord()
  const classes = useStyles()

  const shouldPerformQuery = isUserStaff(user)
  const [, , results] = useDatabaseQuery(
    CollectionNames.AssetAmendments,
    shouldPerformQuery
      ? [[AssetAmendmentFieldNames.isRejected, Operators.EQUALS, null]]
      : false
  )

  if (!user || !isUserStaff(user) || !results || !results.length) {
    return null
  }

  return (
    <Paper className={classes.paper}>
      There are {results ? results.length : '-'} asset amendments pending. Click{' '}
      <Link to={routes.adminAssetAmendments}>here</Link> to approve.
    </Paper>
  )
}
