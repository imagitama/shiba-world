import React from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  RequestsFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

import Button from '../button'

export default ({ requestId, onClick = null }) => {
  const userId = useFirebaseUserId()
  const [isLoadingRequest, isErroredLoadingRequest, request] = useDatabaseQuery(
    CollectionNames.Requests,
    requestId
  )
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Requests,
    requestId
  )

  // TODO: Check if they are allowed to close this - relying on parent to do this is bad!
  if (!userId) {
    return null
  }

  if (isLoadingRequest) {
    // TODO: Remove this code duplication
    return <Button color="default">Loading...</Button>
  }

  if (isSaving) {
    return <Button color="default">Saving...</Button>
  }

  if ((isErroredLoadingRequest, isSaveError)) {
    return <Button disabled>Error</Button>
  }

  const { [RequestsFieldNames.isClosed]: isClosed } = request

  const onBtnClick = async () => {
    try {
      const newValue = !isClosed

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        [RequestsFieldNames.isClosed]: newValue,
        [RequestsFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [RequestsFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to toggle is closed', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isClosed ? 'Re-open' : 'Mark as closed'}
    </Button>
  )
}
