import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  ProfileFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useUserRecord from '../../hooks/useUserRecord'

import FavoriteSpeciesEditor from '../favorite-species-editor'
import Paper from '../paper'
import Heading from '../heading'

export default () => {
  const userId = useFirebaseUserId()
  const username = useUserRecord(UserFieldNames.username)
  const [, , profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId ? userId : false
  )

  // if logged out OR havent setup profile yet
  if (!userId || !profile || !username) {
    return null
  }

  // null if they choose to skip
  if (profile && profile[ProfileFieldNames.favoriteSpecies] === null) {
    return null
  }

  return (
    <Paper>
      <Heading variant="h2" noTopMargin>
        Favorite Species
      </Heading>
      <FavoriteSpeciesEditor analyticsCategoryName="Global" />
    </Paper>
  )
}
