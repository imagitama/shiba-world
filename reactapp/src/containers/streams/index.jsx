import React from 'react'
import StreamsList from '../../components/streams-list'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import useDatabaseQuery, {
  CollectionNames,
  Operators,
  ProfileFieldNames
} from '../../hooks/useDatabaseQuery'

function Streams() {
  const [isLoading, isError, profiles] = useDatabaseQuery(
    CollectionNames.Profiles,
    [[ProfileFieldNames.twitchUsername, Operators.GREATER_THAN, '']]
  )

  if (isLoading || !profiles) {
    return <LoadingIndicator message="Loading profiles..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load profiles</ErrorMessage>
  }

  return <StreamsList profiles={profiles} />
}

export default () => (
  <>
    <Heading variant="h1">Streams</Heading>
    <BodyText>A list of Twitch streams.</BodyText>
    <Streams />
  </>
)
