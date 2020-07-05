import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../../components/button'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const ToggleFieldButton = ({ userId, fieldName, currentValue }) => {
  const myUserId = useFirebaseUserId()
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  if (isSaving) {
    return 'Saving your changes...'
  }

  return (
    <>
      {isSuccess ? 'Saved!' : isErrored ? 'Failed to save' : ''}
      <Button
        onClick={async () => {
          try {
            await save({
              [fieldName]: !currentValue,
              lastModifiedBy: createRef(CollectionNames.Users, myUserId),
              lastModifiedAt: new Date()
            })
          } catch (err) {
            console.error('Failed to toggle field', { userId, fieldName }, err)
            handleError(err)
          }
        }}>
        Toggle
      </Button>
    </>
  )
}

const AdminUserManagement = () => {
  const [isLoading, isErrored, users] = useDatabaseQuery(CollectionNames.Users)

  if (isLoading) {
    return <LoadingIndicator>Loading users...</LoadingIndicator>
  }

  if (isErrored) {
    return <ErrorMessage>ailed to load users. Please try again</ErrorMessage>
  }

  if (!users.length) {
    return 'Found no users'
  }

  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Is Editor</TableCell>
            <TableCell>Is Admin</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(({ id, username, isEditor, isAdmin }) => (
            <TableRow key={id}>
              <TableCell>{id}</TableCell>
              <TableCell>{username}</TableCell>
              <TableCell>
                {isEditor ? 'Y' : 'N'}
                <br />
                <ToggleFieldButton
                  userId={id}
                  currentValue={isEditor}
                  fieldName="isEditor">
                  Toggle
                </ToggleFieldButton>
              </TableCell>
              <TableCell>
                {isAdmin ? 'Y' : 'N'}
                <br />
                <ToggleFieldButton
                  userId={id}
                  currentValue={isAdmin}
                  fieldName="isAdmin">
                  Toggle
                </ToggleFieldButton>
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}

export default AdminUserManagement
