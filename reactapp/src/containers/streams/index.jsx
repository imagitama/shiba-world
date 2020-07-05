import React from 'react'
import StreamsList from '../../components/streams-list'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'

export default () => (
  <>
    <Heading variant="h1">Streams</Heading>
    <BodyText>A list of Twitch streams.</BodyText>
    <StreamsList />
  </>
)
