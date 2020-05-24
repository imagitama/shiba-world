import React from 'react'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import Notice from '../notice'

export default () => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Notices
  )

  if (isErrored) {
    return 'Failed to load notices'
  }

  if (isLoading || !results || !results.length) {
    return null
  }

  return (
    <div>
      {results.map(({ id, ...notice }) => (
        <Notice key={id} {...notice} />
      ))}
    </div>
  )
}
