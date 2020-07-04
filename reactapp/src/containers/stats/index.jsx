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

function DownloadsStats() {
  const classes = useStyles()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Downloads,
    undefined
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find downloads</ErrorMessage>
  }

  const downloadsByAssetId = results.reduce(
    (currentObj, download) => ({
      ...currentObj,
      [download.asset.id]: {
        asset: download.asset,
        count: currentObj[download.asset.id]
          ? currentObj[download.asset.id].count + 1
          : 1
      }
    }),
    {}
  )

  return (
    <div className={classes.downloadsContainer}>
      <Heading variant="h2">Most Popular 10 Downloads</Heading>
      {Object.entries(downloadsByAssetId)
        .sort(([, { count: countA }], [, { count: countB }]) => countA - countB)
        .reverse()
        .slice(0, 10)
        .map(([assetId, { asset }]) => (
          <div key={assetId}>{asset.title}</div>
        ))}
    </div>
  )
}

export default () => {
  return (
    <>
      <Heading variant="h1">Stats</Heading>
      <AdultContentEnabledStats />
      <DownloadsStats />
    </>
  )
}
