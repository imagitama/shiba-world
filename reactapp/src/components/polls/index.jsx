import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  PollsFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import Poll from '../poll'
import useUserRecord from '../../hooks/useUserRecord'

export default () => {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Polls,
    user ? [[PollsFieldNames.isClosed, Operators.EQUALS, false]] : false, // only allow logged in users to answer
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
