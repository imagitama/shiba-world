import React, { Fragment } from 'react'
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
  AuthorFieldNames,
  OrderDirections,
  DiscordServerFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { canEditDiscordServer } from '../../utils'
import useUserRecord from '../../hooks/useUserRecord'
import speciesMeta from '../../species-meta'

function DiscordServers() {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.DiscordServers,
    undefined,
    undefined,
    [AuthorFieldNames.name, OrderDirections.ASC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get authors</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  const resultsBySpeciesName = {}
  const noSpeciesResults = []

  results.forEach(result => {
    if (
      result[DiscordServerFieldNames.species] &&
      result[DiscordServerFieldNames.species].length
    ) {
      result[DiscordServerFieldNames.species].forEach(speciesName => {
        if (!(speciesName in resultsBySpeciesName)) {
          resultsBySpeciesName[speciesName] = []
        }
        resultsBySpeciesName[speciesName].push(result)
      })
    } else {
      noSpeciesResults.push(result)
    }
  })

  return (
    <>
      {Object.entries(resultsBySpeciesName).map(
        ([speciesName, resultsForSpecies]) => (
          <Fragment key={speciesName}>
            <Heading variant="h2">
              <Link
                to={routes.viewSpeciesWithVar.replace(
                  ':speciesName',
                  speciesName
                )}>
                {' '}
                {speciesMeta[speciesName].name}
              </Link>
            </Heading>
            <DiscordServerResults discordServers={resultsForSpecies} />
          </Fragment>
        )
      )}
      <Heading variant="h2">No Species Specified</Heading>
      <DiscordServerResults discordServers={noSpeciesResults} />
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
      {canEditDiscordServer(user) && (
        <Button url={routes.createDiscordServer}>Create</Button>
      )}
      <DiscordServers />
    </>
  )
}