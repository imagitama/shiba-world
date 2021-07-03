import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { Helmet } from 'react-helmet'

import FormattedDate from '../../components/formatted-date'
import Heading from '../../components/heading'
import CachedView from '../../components/cached-view'

import {
  CollectionNames,
  HistoryFieldNames,
  OrderDirections,
  AuthorFieldNames,
  AssetFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

function FormattedUserName({ message, parent, createdBy }) {
  if (message === 'User signup') {
    return (
      <Link to={routes.viewUserWithVar.replace(':userId', parent.id)}>
        {parent[UserFieldNames.username]
          ? parent[UserFieldNames.username]
          : 'Someone'}
      </Link>
    )
  }

  if (createdBy) {
    return (
      <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
        {createdBy[UserFieldNames.username]
          ? createdBy[UserFieldNames.username]
          : 'Someone'}
      </Link>
    )
  }

  // History before June 2020 had no user field
  return 'Someone'
}

function getUrlForRelevantData(collectionName, result) {
  switch (collectionName) {
    case CollectionNames.Assets:
      return routes.viewAssetWithVar.replace(
        ':assetId',
        result[AssetFieldNames.slug] || result.id
      )
    case CollectionNames.Requests:
      return routes.viewRequestWithVar.replace(':requestId', result.id)
    case CollectionNames.Users:
      return routes.viewUserWithVar.replace(':userId', result.id)
    case CollectionNames.Authors:
      return routes.viewAuthorWithVar.replace(':authorId', result.id)
    default:
      return '#'
  }
}

function getLabelForRelevantData(collectionName, result) {
  switch (collectionName) {
    case CollectionNames.Assets:
    case CollectionNames.Requests:
      if (result.title) {
        return result.title
      } else {
        return 'an asset'
      }
    case CollectionNames.Authors:
      if (result[AuthorFieldNames.name]) {
        return result[AuthorFieldNames.name]
      } else {
        return 'an author'
      }
    case CollectionNames.Users:
      if (result.username) {
        return result.username
      } else {
        return 'a user'
      }
    default:
      return '(unknown collection name)'
  }
}

function LinkToRelevantData({ collectionName, result }) {
  if (!result) {
    return 'something'
  }
  return (
    <Link to={getUrlForRelevantData(collectionName, result)}>
      {getLabelForRelevantData(collectionName, result)}
    </Link>
  )
}

function FormattedMessage({ message, parent, createdBy, data }) {
  switch (message) {
    case 'Edited asset':
      return (
        <>
          edited the asset{' '}
          <LinkToRelevantData
            collectionName={CollectionNames.Assets}
            result={parent}
          />
        </>
      )
    case 'Created asset':
      return (
        <>
          created the asset{' '}
          <LinkToRelevantData
            collectionName={CollectionNames.Assets}
            result={parent}
          />
        </>
      )

    case 'Edited author':
      return (
        <>
          edited the author{' '}
          <LinkToRelevantData
            collectionName={CollectionNames.Authors}
            result={parent}
          />
        </>
      )
    case 'Created author':
      return (
        <>
          created the author{' '}
          <LinkToRelevantData
            collectionName={CollectionNames.Authors}
            result={parent}
          />
        </>
      )

    case 'Edited user':
      if (createdBy && createdBy.id === parent.id) {
        return <>edited their own account</>
      }

      return (
        <>
          edited the account of{' '}
          <LinkToRelevantData
            collectionName={CollectionNames.Users}
            result={parent}
          />
        </>
      )
    case 'Edited profile':
      if (createdBy && createdBy.id === parent.id) {
        return <>edited their own profile</>
      }
      return (
        <>
          edited the profile of{' '}
          <LinkToRelevantData
            collectionName={CollectionNames.Users}
            result={parent}
          />
        </>
      )
    case 'User signup':
      return <>signed up</>

    case 'Created comment':
      return (
        <>
          commented on{' '}
          <LinkToRelevantData
            collectionName={getCollectionNameForResult(data.parent)}
            result={data.parent}
          />
        </>
      )

    default:
      return message
  }
}

function getCollectionNameForResult(result) {
  if (!result) {
    return ''
  }
  if (result.parentPath) {
    return result.parentPath
  }
  if (result.parent) {
    return result.parent.id
  }
  return result.refPath.split('/')[0]
}

function filterUnwantedResults(result) {
  const collectionName = getCollectionNameForResult(result)

  if (collectionName === CollectionNames.Assets) {
    if (result.isDeleted || !result.isApproved || result.isPrivate) {
      return false
    }
  }

  return true
}

function compressResults(results) {
  let lastCreatedBy
  let buffer = []
  let newResults = []

  function processBuffer(lastCreatedBy) {
    if (buffer.length >= 5) {
      newResults.push({
        id: buffer.map(({ id }) => id).join(','),
        createdBy: lastCreatedBy,
        children: buffer
      })
    } else {
      newResults = newResults.concat(buffer)
    }
  }

  for (const result of results) {
    // If same author as previous entry
    if (
      result.createdBy &&
      lastCreatedBy &&
      result.createdBy.id === lastCreatedBy.id
    ) {
      // Store in a buffer for later iterations
      buffer.push(result)

      // If last item then the "future" processing will never happen
      if (results.indexOf(result) === results.length - 1) {
        processBuffer(lastCreatedBy)
      }

      // If a brand new author
    } else {
      processBuffer(lastCreatedBy)

      buffer = []

      // Don't forget we are processing old results so we need to add this one too
      newResults.push(result)
    }

    lastCreatedBy = result.createdBy
  }

  return newResults
}

function ResultsTable({ results }) {
  const [expandedResults, setExpandedResults] = useState({})

  const onToggleClick = id =>
    setExpandedResults({
      ...expandedResults,
      [id]: expandedResults[id] ? false : true
    })

  return (
    <Table>
      <TableBody>
        {results.map(
          ({
            id,
            message,
            parent,
            createdBy = null,
            createdAt,
            children,
            data
          }) => (
            <TableRow key={id} title={id}>
              {children ? (
                <TableCell>
                  {createdBy && createdBy[UserFieldNames.username]
                    ? createdBy[UserFieldNames.username]
                    : 'Someone'}{' '}
                  performed {children.length} actions -{' '}
                  <span onClick={() => onToggleClick(id)}>Toggle</span>
                  {expandedResults[id] && <ResultsTable results={children} />}
                </TableCell>
              ) : (
                <TableCell>
                  <FormattedUserName
                    createdBy={createdBy}
                    parent={parent}
                    message={message}
                  />{' '}
                  <FormattedMessage
                    message={message}
                    parent={parent}
                    createdBy={createdBy}
                    data={data}
                  />{' '}
                  <FormattedDate date={createdAt} />
                </TableCell>
              )}
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  )
}

const Renderer = ({ items }) => {
  const resultsWithoutUnwantedResult = items.filter(({ parent }) =>
    filterUnwantedResults(parent)
  )

  const compressedResults = compressResults(resultsWithoutUnwantedResult)

  return (
    <Paper>
      <ResultsTable results={compressedResults} />
    </Paper>
  )
}

export default () => {
  return (
    <>
      <Helmet>
        <title>View the recent activity around the site | VRCArena</title>
        <meta
          name="description"
          content="Take a look at the actions performed by users on the site including editing assets, profiles and more."
        />
      </Helmet>
      <Heading variant="h1">Recent Activity</Heading>
      <CachedView
        viewName="activity"
        sortKey="activity"
        defaultFieldName={HistoryFieldNames.createdAt}>
        <Renderer />
      </CachedView>
    </>
  )
}
