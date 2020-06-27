import React from 'react'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import useDatabase from '../../hooks/useDatabase'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import Button from '../../components/button'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { handleError } from '../../error-handling'

const ToggleFieldButton = ({ userId, fieldName, currentValue }) => {
  const [isSaving, didSaveFailOrSucceed, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
  )

  if (isSaving) {
    return 'Saving your changes...'
  }

  return (
    <>
      {didSaveFailOrSucceed === true
        ? 'Saved!'
        : didSaveFailOrSucceed === false
        ? 'Failed to save'
        : ''}
      <Button
        onClick={async () => {
          try {
            await save({
              [fieldName]: !currentValue
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
  const [isLoadingRecord, didLoadingRecordFail, users] = useDatabase(
    CollectionNames.Users
  )

  if (isLoadingRecord) {
    return <LoadingIndicator>Loading users...</LoadingIndicator>
  }

  if (didLoadingRecordFail) {
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
