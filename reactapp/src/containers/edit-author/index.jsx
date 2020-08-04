import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditAuthor } from '../../utils'

export default ({
  match: {
    params: { authorId }
  }
}) => {
  const [isLoading, isErrored, user] = useUserRecord()
  const [isLoadingAuthor, isErroredLoadingAuthor, result] = useDatabaseQuery(
    CollectionNames.Authors,
    authorId
  )

  if (isLoading || isLoadingAuthor) {
    return <LoadingIndicator />
  }

  if (isErrored || isErroredLoadingAuthor) {
    return <ErrorMessage />
  }

  if (!canEditAuthor(user, result)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Edit Author</Heading>
      <GenericEditor
        collectionName={CollectionNames.Authors}
        id={authorId}
        analyticsCategory="EditAuthor"
        saveBtnAction="Click save author button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewAuthorWithVar.replace(':authorId', authorId)}
        cancelUrl={routes.viewAuthorWithVar.replace(':authorId', authorId)}
      />
    </>
  )
}
