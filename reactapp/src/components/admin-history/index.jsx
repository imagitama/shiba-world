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
import NoResultsMessage from '../no-results-message'

import useDatabaseQuery, {
  CollectionNames,
  HistoryFieldNames,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { createRef } from '../../utils'

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

const maxLabelLength = 50

function getTrucatedLabel(label) {
  if (label.length > maxLabelLength) {
    return `${label.substr(0, maxLabelLength)}...`
  }
  return label
}

function FieldValue({ val }) {
  if (typeof val === 'string') {
    if (val.includes('http')) {
      return <a href={val}>{getTrucatedLabel(val)}</a>
    }
  }
  if (Array.isArray(val)) {
    return val.map((subVal, idx) => (
      <>
        {idx !== 0 && ', '}
        <FieldValue val={subVal} />
      </>
    ))
  }
  if (val !== null && typeof val === 'object') {
    if (val.id) {
      return <span>{val.id}</span>
    } else {
      return Object.entries(val).map(([key, subVal]) => (
        <>
          {key}: <FieldValue val={subVal} />
        </>
      ))
    }
  }
  if (val === true) {
    return 'true'
  }
  if (val === false) {
    return 'false'
  }
  return <span>{val}</span>
}

function MessageForItem({ kind, path, lhs, rhs }) {
  return (
    <span>
      {path.join('.')} <FieldValue val={lhs} /> {getKindAsReadable(kind)}{' '}
      <FieldValue val={rhs} />
    </span>
  )
}

function HistoryData({ data }) {
  if (data.diff) {
    return (
      <ul>
        {data.diff.map(({ kind, path, lhs, rhs }) => (
          <li key={`${kind}.${path}`}>
            <MessageForItem kind={kind} path={path} lhs={lhs} rhs={rhs} />
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
            {key} = <FieldValue val={val} />
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

export default ({ assetId = null, limit = 20 }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.History,
    assetId
      ? [
          [
            HistoryFieldNames.parent,
            Operators.EQUALS,
            createRef(CollectionNames.Assets, assetId)
          ]
        ]
      : undefined,
    limit,
    [HistoryFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to retrieve history</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No history found</NoResultsMessage>
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
          {results.map(
            ({
              id,
              [HistoryFieldNames.message]: message,
              [HistoryFieldNames.parent]: parent,
              [HistoryFieldNames.data]: data,
              [HistoryFieldNames.createdAt]: createdAt
            }) => (
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
            )
          )}
        </TableBody>
      </Table>
    </Paper>
  )
}
