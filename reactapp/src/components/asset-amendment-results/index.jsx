import React from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import AssetAmendmentResultsItem from '../asset-amendment-results-item'
import ErrorMessage from '../error-message'

export default ({
  results,
  showControls = false,
  analyticsCategoryName = ''
}) =>
  results.length ? (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Asset</TableCell>
            <TableCell>New tags</TableCell>
            <TableCell>Meta</TableCell>
            <TableCell>{showControls ? 'Controls' : 'Status'}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map(result => (
            <AssetAmendmentResultsItem
              key={result.id}
              result={result}
              showControls={showControls}
              analyticsCategoryName={analyticsCategoryName}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  ) : (
    <ErrorMessage>No results</ErrorMessage>
  )
