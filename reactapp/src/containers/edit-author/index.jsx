import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'
// import Button from '../../components/button'
// import SyncAuthorWithOwnerForm from '../../components/sync-author-with-owner-form'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditAuthor } from '../../utils'

export default ({
  match: {
    params: { authorId }
  }
}) => {
  const isCreating = !authorId

  const [isLoading, isErrored, user] = useUserRecord()
  const [isLoadingAuthor, isErroredLoadingAuthor, result] = useDatabaseQuery(
    CollectionNames.Authors,
    authorId
  )
  // const [isSyncWithOwnerFormOpen, setIsSyncWithOwnerFormOpen] = useState(false)

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
      <Heading variant="h1">{isCreating ? 'Create' : 'Edit'} Author</Heading>
      {/* <Button onClick={() => setIsSyncWithOwnerFormOpen(currentVal => !currentVal)}>Open Sync With Profile</Button> */}
      <GenericEditor
        collectionName={CollectionNames.Authors}
        id={isCreating ? null : authorId}
        analyticsCategory={isCreating ? 'CreateAuthor' : 'EditAuthor'}
        saveBtnAction="Click save author button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewAuthorWithVar.replace(':authorId', authorId)}
        getSuccessUrl={newId =>
          routes.viewAuthorWithVar.replace(':authorId', newId)
        }
        cancelUrl={
          isCreating
            ? routes.authors
            : routes.viewAuthorWithVar.replace(':authorId', authorId)
        }
      />
    </>
  )
}
