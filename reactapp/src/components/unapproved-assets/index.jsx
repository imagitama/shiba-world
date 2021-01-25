import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'

import * as routes from '../../routes'
import { trackAction } from '../../analytics'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import ApproveAssetButton from '../approve-asset-button'

const useStyles = makeStyles({
  table: {
    width: '100%'
  }
})

function AssetsTable({ assets }) {
  const classes = useStyles()

  return (
    <Paper>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assets.map(({ id, title, createdBy }) => (
            <TableRow key={id}>
              <TableCell>
                <Link to={routes.viewAssetWithVar.replace(':assetId', id)}>
                  {title}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
                  {createdBy.username}
                </Link>
              </TableCell>
              <TableCell>
                <ApproveAssetButton
                  assetId={id}
                  onClick={({ newValue }) =>
                    trackAction(
                      'AdminAssets',
                      newValue === true ? 'Approved asset' : 'Unapproved asset'
                    )
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default () => {
  let [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    [[AssetFieldNames.isApproved, Operators.EQUALS, false]],
    1000,
    undefined,
    true,
    undefined,
    true
  )

  results = results
    ? results.filter(({ isDeleted }) => isDeleted !== true)
    : null

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get unapproved assets</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetsTable assets={results} />
}
