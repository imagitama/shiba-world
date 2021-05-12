import React, { useState } from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'

import useDatabaseQuery, {
  CollectionNames,
  options,
  ReportFieldNames,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import ReportResults from '../report-results'

const Reports = ({ areDeletedReportsVisible }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Reports,
    areDeletedReportsVisible === true
      ? []
      : [[ReportFieldNames.isDeleted, Operators.EQUALS, false]],
    {
      [options.subscribe]: true,
      [options.populateRefs]: true,
      [options.queryName]: 'admin-asset-reports',
      [options.orderBy]: [ReportFieldNames.createdAt, OrderDirections.DESC]
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

export default () => {
  const [areDeletedReportsVisible, setAreDeletedReportsVisible] = useState(
    false
  )

  return (
    <div>
      <FormControl>
        <FormControlLabel
          control={
            <Checkbox
              checked={areDeletedReportsVisible}
              onChange={() =>
                setAreDeletedReportsVisible(currentVal => !currentVal)
              }
            />
          }
          label="Show deleted reports"
        />
      </FormControl>
      <Reports areDeletedReportsVisible={areDeletedReportsVisible} />
    </div>
  )
}
