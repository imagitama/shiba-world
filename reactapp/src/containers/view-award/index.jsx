import React from 'react'
import { useParams } from 'react-router'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import ErrorMessage from '../../components/error-message'
import Award from '../../components/award'
import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
// import UserList from '../../components/user-list'

import { getNameForAwardId, allAwardIds } from '../../awards'
import useDatabaseQuery, {
  CollectionNames,
  AwardsForUsersFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  title: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
})

function UsersWithAward({ awardId }) {
  const isOneYearAnniversaryAwardId =
    awardId === allAwardIds['1_year_anniversary']

  const [isLoading, isError, usersWithAward] = useDatabaseQuery(
    CollectionNames.AwardsForUsers,
    isOneYearAnniversaryAwardId
      ? false
      : [[AwardsForUsersFieldNames.awards, Operators.ARRAY_CONTAINS, awardId]]
  )

  if (isLoading) {
    return <LoadingIndicator message="Finding users with that award..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to find users with that award</ErrorMessage>
  }

  if (isOneYearAnniversaryAwardId) {
    return <>Over 2000 users have this award!</>
  }

  return <>{usersWithAward && usersWithAward.length} users have that award</>

  //return <UserList users={usersWithAward} />
}

export default () => {
  const { awardId } = useParams()
  const classes = useStyles()

  if (!awardId) {
    return <ErrorMessage>No award ID provided</ErrorMessage>
  }

  const awardName = getNameForAwardId(awardId)

  return (
    <>
      <Helmet>
        <title>View the award "{awardName}" | VRCArena</title>
        <meta
          name="description"
          content={`View more information about the award named "${awardName}".`}
        />
      </Helmet>
      <div>
        <div className={classes.title}>
          {Object.keys(allAwardIds).map(id => (
            <Award key={id} awardId={id} isLarge={id === awardId} />
          ))}
        </div>
        <Heading variant="h2">Users with this award</Heading>
        <UsersWithAward awardId={awardId} />
      </div>
    </>
  )
}
