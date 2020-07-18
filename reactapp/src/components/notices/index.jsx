import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  NoticesFieldNames,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'
import Notice from '../notice'

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Notices,
    [[NoticesFieldNames.isVisible, Operators.EQUALS, true]],
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
