import React from 'react'
import StreamsList from '../../components/streams-list'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import CachedView from '../../components/cached-view'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'

const Renderer = ({ items }) => <StreamsList profilesWithUsers={items} />

export default () => (
  <>
    <Heading variant="h1">Streams</Heading>
    <BodyText>A list of Twitch streams.</BodyText>
    <CachedView
      viewName="streams"
      sortKey="streams"
      sortOptions={[
        {
          label: 'Username',
          fieldName: UserFieldNames.username
        }
      ]}
      defaultFieldName={UserFieldNames.username}>
      <Renderer />
    </CachedView>
  </>
)
