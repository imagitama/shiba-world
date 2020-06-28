import React from 'react'
import { Link } from 'react-router-dom'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import { Helmet } from 'react-helmet'

import FormattedDate from '../../components/formatted-date'
import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'

import useDatabaseQuery, {
  CollectionNames,
  HistoryFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

function FormattedUserName({ message, parent, createdBy }) {
  if (message === 'User signup') {
    return (
      <Link to={routes.viewUserWithVar.replace(':userId', parent.id)}>
        {parent.username}
      </Link>
    )
  }

  if (createdBy) {
    return (
      <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
        {createdBy.username}
      </Link>
    )
  }

  // History before June 2020 had no user field
  return 'Someone'
}

function FormattedMessage({ message, parent, createdBy }) {
  const LinkToParentAsset = () => (
    <Link to={routes.viewAssetWithVar.replace(':assetId', parent.id)}>
      {parent.title}
    </Link>
  )
  const LinkToParentUser = () => (
    <Link to={routes.viewUserWithVar.replace(':userId', parent.id)}>
      {parent.username}
    </Link>
  )
  switch (message) {
    case 'Edited asset':
      return (
        <>
          edited the asset <LinkToParentAsset />
        </>
      )
    case 'Created asset':
      return (
        <>
          created the asset <LinkToParentAsset />
        </>
      )
    case 'Edited user':
      if (createdBy && createdBy.id === parent.id) {
        return <>edited their own account</>
      }

      return (
        <>
          edited the account of <LinkToParentUser />
        </>
      )
    case 'Edited profile':
      if (createdBy && createdBy.id === parent.id) {
        return <>edited their own profile</>
      }
      return (
        <>
          edited the profile of <LinkToParentUser />
        </>
      )
    case 'User signup':
      return <>signed up</>
    default:
      return message
  }
}

function getCollectionNameForResult(result) {
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
    <>
      <Helmet>
        <title>View the recent activity around the site | VRCArena</title>
        <meta
          name="description"
          content="Take a look at the actions performed by users on the site including editing assets, profiles and more."
        />
      </Helmet>
      <Heading variant="h1">Recent Activity</Heading>
      <Paper>
        <Table>
          <TableBody>
            {results
              .filter(({ parent }) => filterUnwantedResults(parent))
              .map(({ id, message, parent, createdBy = null, createdAt }) => (
                <TableRow key={id}>
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
                    />{' '}
                    <FormattedDate date={createdAt} />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  )
}
