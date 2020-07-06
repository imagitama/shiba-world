import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  DownloadsFieldNames,
  Operators
} from '../../../../hooks/useDatabaseQuery'
import { createRef } from '../../../../utils'

import FormattedDate from '../../../formatted-date'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'

function Result({ result }) {
  return (
    <li>
      {result.createdBy ? result.createdBy.username : 'A guest'} downloaded it{' '}
      <FormattedDate date={result.createdAt} />
    </li>
  )
}

export default ({ assetId }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Downloads,
    [
      [
        DownloadsFieldNames.asset,
        Operators.EQUALS,
        createRef(CollectionNames.Assets, assetId)
      ]
    ]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to query</ErrorMessage>
  }

  if (!results.length) {
    return 'No downloads yet'
  }

  return (
    <ul>
      {results.map(result => (
        <Result key={result.id} result={result} />
      ))}
    </ul>
  )
}
