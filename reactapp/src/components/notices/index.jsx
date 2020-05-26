import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  NoticesFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import Notice from '../notice'

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Notices,
    undefined,
    100,
    [NoticesFieldNames.order, OrderDirections.ASC]
  )

  if (isErrored) {
    return 'Failed to load notices'
  }

  if (isLoading || !results || !results.length) {
    return null
  }

  return (
    <div>
      {results.map(notice => (
        <Notice key={notice.id} {...notice} />
      ))}
    </div>
  )
}
