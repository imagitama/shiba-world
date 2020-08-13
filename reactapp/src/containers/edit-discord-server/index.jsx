import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditDiscordServer } from '../../utils'

export default ({
  match: {
    params: { discordServerId }
  }
}) => {
  const [isLoading, isErrored, user] = useUserRecord()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage />
  }

  if (!canEditDiscordServer(user)) {
    return <NoPermissionMessage />
  }

  const isCreating = !discordServerId

  return (
    <>
      <Heading variant="h1">
        {isCreating ? 'Create' : 'Edit'} Discord Server
      </Heading>
      <GenericEditor
        collectionName={CollectionNames.DiscordServers}
        id={isCreating ? null : discordServerId}
        analyticsCategory={
          isCreating ? 'CreateDiscordServer' : 'EditDiscordServer'
        }
        saveBtnAction="Click save button"
        viewBtnAction="Click view item button after save"
        cancelBtnAction="Click cancel button"
        successUrl={routes.viewDiscordServerWithVar.replace(
          ':discordServerId',
          discordServerId
        )}
        getSuccessUrl={newId =>
          routes.viewDiscordServerWithVar.replace(':discordServerId', newId)
        }
        cancelUrl={
          isCreating
            ? routes.discordServers
            : routes.viewDiscordServerWithVar.replace(
                ':discordServerId',
                discordServerId
              )
        }
      />
    </>
  )
}
