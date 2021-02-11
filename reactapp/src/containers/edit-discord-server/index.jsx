import React from 'react'

import GenericEditor from '../../components/generic-editor'
import Heading from '../../components/heading'
import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import LoadingIndicator from '../../components/loading-indicator'
import Message from '../../components/message'

import { CollectionNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canCreateDiscordServer, canEditDiscordServer } from '../../permissions'

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

  const isCreating = !discordServerId

  if (
    (isCreating && !canCreateDiscordServer(user)) ||
    (!isCreating && !canEditDiscordServer(user))
  ) {
    return <NoPermissionMessage />
  }

  return (
    <>
      <Heading variant="h1">
        {isCreating ? 'Create' : 'Edit'} Discord Server
      </Heading>
      {isCreating && (
        <Message>
          Please contact a staff member on our official Discord to review your
          Discord server and approve it
        </Message>
      )}
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
