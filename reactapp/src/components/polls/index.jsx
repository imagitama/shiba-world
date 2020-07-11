import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  PollsFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import Poll from '../poll'

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Polls,
    [[PollsFieldNames.isClosed, Operators.EQUALS, false]],
    100
  )

  if (isErrored) {
    return 'Failed to load polls'
  }

  if (isLoading || !results || !results.length) {
    return null
  }

  return (
    <div>
      {results.map(poll => (
        <Poll key={poll.id} poll={poll} />
      ))}
    </div>
  )
}
