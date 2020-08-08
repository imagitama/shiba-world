import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditUsers } from '../../permissions'

export default ({
  match: {
    params: { userId }
  }
}) => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (!canEditUsers(user)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Edit User</Heading>
      <GenericEditor
        collectionName={CollectionNames.Users}
        id={userId}
        analyticsCategory="EditAuthor"
        saveBtnAction="Click save user button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewUserWithVar.replace(':userId', userId)}
        cancelUrl={routes.viewUserWithVar.replace(':userId', userId)}
        extraFormData={{
          userId
        }}
      />
    </>
  )
}
