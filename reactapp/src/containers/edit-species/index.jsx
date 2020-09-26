import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditSpecies } from '../../utils'

export default ({
  match: {
    params: { speciesName: speciesId } // change to speciesId later
  }
}) => {
  const [isLoading, isErrored, user] = useUserRecord()
  const [isLoadingItem, isErrorLoadingItem, result] = useDatabaseQuery(
    CollectionNames.Species,
    speciesId
  )

  if (isLoading || isLoadingItem) {
    return <LoadingIndicator />
  }

  if (isErrored || isErrorLoadingItem) {
    return <ErrorMessage />
  }

  if (!canEditSpecies(user, result)) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">Edit Species</Heading>
      <GenericEditor
        collectionName={CollectionNames.Species}
        id={speciesId}
        analyticsCategory="EditSpecies"
        saveBtnAction="Click save species button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewSpeciesWithVar.replace(
          ':speciesName',
          speciesId
        )}
        cancelUrl={routes.viewSpeciesWithVar.replace(':speciesName', speciesId)}
      />
    </>
  )
}
