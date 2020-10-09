import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditSpecies } from '../../utils'

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (!canEditSpecies(user)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Create Species</Heading>
      <GenericEditor
        collectionName={CollectionNames.Species}
        analyticsCategory="CreateSpecies"
        saveBtnAction="Click save species button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        getSuccessUrl={id =>
          routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', id)
        }
      />
    </>
  )
}
