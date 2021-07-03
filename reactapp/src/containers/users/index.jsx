import React from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'

import UserList from '../../components/user-list'
import Heading from '../../components/heading'
import Message, { styles as messageStyles } from '../../components/message'
import CachedView from '../../components/cached-view'

import useDatabaseQuery, {
  CollectionNames,
  UserFieldNames,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'

const sortKey = 'view-users'

const Renderer = ({ items }) => <UserList users={items} />

export default () => {
  return (
    <>
      <Helmet>
        <title>
          View a list of users that are signed up on the site | VRCArena
        </title>
        <meta
          name="description"
          content={`Find every user that has signed up to VRCArena.`}
        />
      </Helmet>
      <Heading variant="h1">All Users</Heading>
      <Message>
        Looking for a particular user? Use the search bar at the top and select
        "Users" from the dropdown
      </Message>
      <CachedView
        viewName="view-users"
        sortKey={sortKey}
        sortOptions={[
          {
            label: 'Sign up date',
            fieldName: UserFieldNames.createdAt
          }
        ]}
        defaultFieldName={UserFieldNames.createdAt}>
        <Renderer />
      </CachedView>
    </>
  )
}
