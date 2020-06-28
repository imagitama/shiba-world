import React from 'react'
import LazyLoad from 'react-lazyload'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import TagChip from '../tag-chip'
import LoadingIndicator from '../loading-indicator'

function Tags() {
  const [isLoading, isErrored, record] = useDatabaseQuery(
    CollectionNames.Summaries,
    'tags'
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || !record || !record.allTags) {
    return 'None'
  }

  return record.allTags.map(tag => <TagChip key={tag} tagName={tag} />)
}

export default ({ lazyLoad = false }) => {
  if (lazyLoad) {
    return (
      <LazyLoad placeholder={<LoadingIndicator />}>
        <Tags />
      </LazyLoad>
    )
  }
  return <Tags />
}
