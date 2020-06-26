import React from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import FormattedDate from '../formatted-date'
import ErrorMessage from '../error-message'
import LoadingIndicator from '../loading-indicator'

import useDatabaseQuery, {
  CollectionNames,
  HistoryFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

function getKindAsReadable(kind) {
  switch (kind) {
    case 'N':
      return '+'
    case 'D':
      return '-'
    case 'E':
      return '->'
    case 'A':
      return 'Array'
    default:
      return '???'
  }
}

function getMessageForItem(kind, path, lhs, rhs, item) {
  return `${path.join('.')} "${lhs}" ${getKindAsReadable(kind)} "${rhs}"`
}

function stringify(val) {
  if (typeof val === 'object') {
    if (val.id) {
      return val.id
    }
  }
  return JSON.stringify(val)
}

function HistoryData({ data }) {
  if (data.diff) {
    return (
      <ul>
        {data.diff.map(({ kind, path, lhs, rhs }) => (
          <li key={`${kind}.${path}`}>
            {getMessageForItem(kind, path, lhs, rhs)}
          </li>
        ))}
      </ul>
    )
  }
  if (data.fields) {
    return (
      <ul>
        {Object.entries(data.fields).map(([key, val]) => (
          <li key={key}>
            {key} = {stringify(val)}
          </li>
        ))}
      </ul>
    )
  }
}

function ParentLabel({ parent }) {
  const collectionName = parent.refPath.split('/')[0]

  if (collectionName === CollectionNames.Assets) {
    return (
      <Link to={routes.viewAssetWithVar.replace(':assetId', parent.id)}>
        {parent.id}
      </Link>
    )
  }

  return parent.refPath
}

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.History,
    undefined,
    20,
    [HistoryFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve history</ErrorMessage>
  }

  if (!results.length) {
    return 'No history found'
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Message</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {results.map(({ id, message, parent, data, createdAt }) => (
            <TableRow key={id}>
              <TableCell>
                {message}
                <br />
                {parent ? <ParentLabel parent={parent} /> : '(no parent)'}
              </TableCell>
              <TableCell>
                {data ? <HistoryData data={data} /> : '(no data)'}
              </TableCell>
              <TableCell>
                <FormattedDate date={createdAt} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
