import React from 'react'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import { trackAction, actions } from '../../analytics'
import Button from '../button'
import { handleError } from '../../error-handling'

export default ({ requestId }) => {
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isLoadingRequest, isErroredLoadingRequest, request] = useDatabaseQuery(
    CollectionNames.Requests,
    requestId
  )
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Requests,
    requestId
  )

  if (isLoadingUser || isLoadingRequest || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (
    isErroredLoadingUser ||
    isErroredLoadingRequest ||
    didSaveSucceedOrFail === false
  ) {
    return <Button disabled>Error</Button>
  }

  if (!user) {
    return null
  }

  const { isClosed } = request

  const onBtnClick = async () => {
    try {
      await save({
        isClosed: !isClosed,
        lastModifiedBy: userDocument,
        lastModifiedAt: new Date()
      })

      trackAction(isClosed ? actions.OPEN_REQUEST : actions.CLOSE_REQUEST, {
        requestId,
        userId: user && user.id
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
