import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import Heading from '../../components/heading'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'

const useStyles = makeStyles({
  statValue: {
    fontSize: '200%'
  }
})

function AdultContentEnabledStats() {
  const classes = useStyles()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Users
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find perverts</ErrorMessage>
  }

  const numberOfPerverts = results.reduce(
    (tally, { enabledAdultContent }) =>
      enabledAdultContent ? tally + 1 : tally,
    0
  )

  return (
    <>
      <span className={classes.statValue}>{numberOfPerverts}</span> perverts out
      of {results.length} who have enabled adult content
    </>
  )
}

export default () => {
  return (
    <>
      <Heading variant="h1">Stats</Heading>
      <AdultContentEnabledStats />
    </>
  )
}
