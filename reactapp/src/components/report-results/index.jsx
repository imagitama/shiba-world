import React from 'react'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import ReportResultsItem from '../report-results-item'
import ErrorMessage from '../error-message'

export default ({
  reports,
  showAssetDetails = true,
  showControls = false,
  analyticsCategoryName = ''
}) =>
  reports.length ? (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            {showAssetDetails && <TableCell>Asset</TableCell>}
            <TableCell>Reporter</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Status</TableCell>
            {showControls && <TableCell />}
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map(report => (
            <ReportResultsItem
              key={report.id}
              report={report}
              showAssetDetails={showAssetDetails}
              showControls={showControls}
              analyticsCategoryName={analyticsCategoryName}
            />
          ))}
        </TableBody>
      </Table>
    </Paper>
  ) : (
    <ErrorMessage>No reports</ErrorMessage>
  )
