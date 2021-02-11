import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import EditIcon from '@material-ui/icons/Edit'
import LaunchIcon from '@material-ui/icons/Launch'
import Markdown from 'react-markdown'
import SyncIcon from '@material-ui/icons/Sync'

import * as routes from '../../routes'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import Button from '../../components/button'
import DiscordServerWidget from '../../components/discord-server-widget'
import PageControls from '../../components/page-controls'
import Paper from '../../components/paper'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  DiscordServerFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { canEditDiscordServer, createRef } from '../../utils'
import { trackAction } from '../../analytics'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'

const analyticsCategory = 'ViewDiscordServer'

function SyncDiscordServerButton({ discordServerId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(null)

  const onClick = async () => {
    try {
      if (isLoading) {
        return
      }

      setIsLoading(true)
      setIsSuccess(false)

      await callFunction('syncDiscordServerById', {
        id: discordServerId
      })

      setIsLoading(false)
      setIsSuccess(true)
    } catch (err) {
      handleError(err)
      setIsSuccess(false)
    }
  }

  return (
    <Button onClick={onClick} icon={<SyncIcon />}>
      {isLoading
        ? 'Working...'
        : isSuccess === true
        ? 'Synced'
        : isSuccess === false
        ? 'Failed to sync'
        : 'Sync'}
    </Button>
  )
}

export default ({
  match: {
    params: { discordServerId }
  }
}) => {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.DiscordServers,
    discordServerId
  )
  const [, , , save] = useDatabaseSave(
    CollectionNames.DiscordServers,
    discordServerId
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get Discord server</ErrorMessage>
  }

  if (!result) {
    return <ErrorMessage>The Discord server does not exist</ErrorMessage>
  }

  const {
    [DiscordServerFieldNames.name]: name,
    [DiscordServerFieldNames.description]: description,
    [DiscordServerFieldNames.widgetId]: widgetId,
    [DiscordServerFieldNames.iconUrl]: iconUrl,
    [DiscordServerFieldNames.inviteUrl]: inviteUrl,
    [DiscordServerFieldNames.requiresPatreon]: requiresPatreon,
    [DiscordServerFieldNames.patreonUrl]: patreonUrl,
    [DiscordServerFieldNames.isApproved]: isApproved,
    [DiscordServerFieldNames.isDeleted]: isDeleted
  } = result

  return (
    <>
      <Helmet>
        <title>View Discord server {name} | VRCArena</title>
        <meta
          name="description"
          content={`View the Discord server named ${name}`}
        />
      </Helmet>

      {isApproved !== true && <Paper>This asset is unapproved</Paper>}
      {isDeleted !== false && <Paper>This asset is deleted</Paper>}

      {iconUrl && <img src={iconUrl} alt={`Icon for server ${name}`} />}

      <Heading variant="h1">
        <Link
          to={routes.viewAuthorWithVar.replace(
            ':discordServerId',
            discordServerId
          )}>
          {name}
        </Link>
      </Heading>

      {description && <Markdown source={description} />}

      {inviteUrl && (
        <Button
          url={inviteUrl}
          icon={<LaunchIcon />}
          onClick={() =>
            trackAction(
              analyticsCategory,
              'Click Discord server invite button',
              discordServerId
            )
          }>
          Join Server
        </Button>
      )}

      {requiresPatreon && (
        <>
          This server requires you are a Patreon subscriber before you join.
          <br />
          <Button
            url={patreonUrl}
            icon={<LaunchIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click join Patreon button',
                discordServerId
              )
            }>
            Join Patreon
          </Button>
        </>
      )}

      {widgetId && (
        <DiscordServerWidget
          serverId={widgetId}
          joinActionCategory={analyticsCategory}
        />
      )}

      {canEditDiscordServer(user) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.editDiscordServerWithVar.replace(
              ':discordServerId',
              discordServerId
            )}
            icon={<EditIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click edit button',
                discordServerId
              )
            }>
            Edit
          </Button>{' '}
          <Button
            icon={<EditIcon />}
            onClick={async () => {
              try {
                await save({
                  [DiscordServerFieldNames.isApproved]: isApproved
                    ? false
                    : true,
                  [DiscordServerFieldNames.lastModifiedAt]: new Date(),
                  [DiscordServerFieldNames.lastModifiedAt]: createRef(
                    CollectionNames.Users,
                    user.id
                  )
                })
              } catch (err) {
                console.error(err)
                handleError(err)
              }
            }}>
            {isApproved ? 'Unapprove' : 'Approve'}
          </Button>{' '}
          <Button
            icon={<EditIcon />}
            onClick={async () => {
              try {
                await save({
                  [DiscordServerFieldNames.isDeleted]: isDeleted ? false : true,
                  [DiscordServerFieldNames.lastModifiedAt]: new Date(),
                  [DiscordServerFieldNames.lastModifiedAt]: createRef(
                    CollectionNames.Users,
                    user.id
                  )
                })
              } catch (err) {
                console.error(err)
                handleError(err)
              }
            }}>
            {isDeleted ? 'Restore' : 'Delete'}
          </Button>{' '}
          <SyncDiscordServerButton discordServerId={discordServerId} />
        </>
      )}

      <PageControls>
        <Button
          url={routes.discordServers}
          color="default"
          onClick={() =>
            trackAction(analyticsCategory, 'Click all Discord servers button')
          }>
          View All Discord Servers
        </Button>
      </PageControls>
    </>
  )
}
