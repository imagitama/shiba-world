import React from 'react'
import UserOverview from '../../components/user-overview'

export default ({ match: { params } }) => (
  <UserOverview userId={params.userId} />
)
