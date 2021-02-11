import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import DiscordServerResults from '../../components/discord-server-results'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'

import useDatabaseQuery, {
  CollectionNames,
  OrderDirections,
  DiscordServerFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { canCreateDiscordServer, canEditDiscordServer } from '../../permissions'
import useUserRecord from '../../hooks/useUserRecord'

function DiscordServers() {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.DiscordServers,
    undefined,
    undefined,
    [DiscordServerFieldNames.name, OrderDirections.ASC]
  )
  console.log(results)

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get authors</ErrorMessage>
  }

  if (!results || !results.length) {
    return <NoResultsMessage />
  }

  const { publicRecords, privateRecords } = results.reduce(
    (obj, discordServer) => {
      const isPublic =
        discordServer[DiscordServerFieldNames.isApproved] !== false &&
        discordServer[DiscordServerFieldNames.isDeleted] !== true

      return {
        publicRecords: isPublic
          ? obj.publicRecords.concat([discordServer])
          : obj.publicRecords,
        privateRecords: !isPublic
          ? obj.privateRecords.concat([discordServer])
          : obj.privateRecords
      }
    },
    {
      publicRecords: [],
      privateRecords: []
    }
  )

  return (
    <>
      <DiscordServerResults discordServers={publicRecords} />
      {canEditDiscordServer(user) && (
        <>
          <Heading variant="h2">Deleted or unapproved servers</Heading>
          {privateRecords.length ? (
            <DiscordServerResults discordServers={privateRecords} />
          ) : (
            'None'
          )}
        </>
      )}
    </>
  )
}

export default () => {
  const [, , user] = useUserRecord()
  return (
    <>
      <Helmet>
        <title>View all Discord servers | VRCArena</title>
        <meta
          name="description"
          content="Browse Discord servers that are related to the species of VRChat."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.discordServers}>Discord Servers</Link>
      </Heading>
      <BodyText>A list of Discord servers.</BodyText>
      {canCreateDiscordServer(user) && (
        <>
          <br />
          <Button url={routes.createDiscordServer}>Create</Button>
        </>
      )}
      <DiscordServers />
    </>
  )
}
