import React from 'react'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import ReportResults from '../report-results'

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Reports,
    [],
    {
      [options.subscribe]: true,
      [options.populateRefs]: true,
      [options.queryName]: 'admin-asset-reports'
    }
  )

  if (isLoading || !results) {
    return <LoadingIndicator message="Loading reports..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load reports</ErrorMessage>
  }

  if (!results.length) {
    return <ErrorMessage>No reports</ErrorMessage>
  }

  return <ReportResults reports={results} showControls showAssetDetails />
}
