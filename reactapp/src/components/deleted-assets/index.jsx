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
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import * as routes from '../../routes'

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
              <TableCell>{createdBy.username}</TableCell>
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
    [[AssetFieldNames.isDeleted, Operators.EQUALS, true]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get deleted assets</ErrorMessage>
  }

  if (!results.length) {
    return 'None found :)'
  }

  return <AssetsTable assets={results} />
}
