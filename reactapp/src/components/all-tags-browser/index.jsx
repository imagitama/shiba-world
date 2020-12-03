import React, { useState, useEffect, useRef } from 'react'
import LazyLoad from 'react-lazyload'
import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import TagChip from '../tag-chip'
import LoadingIndicator from '../loading-indicator'

function sortByAlpha(a, b) {
  return a.localeCompare(b)
}

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

  return record.allTags
    .filter(tag => tag)
    .sort(sortByAlpha)
    .map(tag => <TagChip key={tag} tagName={tag} />)
}

export default ({ lazyLoad = false }) => {
  const [shouldPerformLookup, setShouldPerformLookup] = useState(false)
  const timeoutRef = useRef()

  useEffect(() => {
    if (!lazyLoad) {
      return
    }

    // We use lazy load but while loading assets this component is always in
    // the viewport
    // So wait a bit for assets to (probably) finish loading before we actually
    // try
    timeoutRef.current = setTimeout(() => setShouldPerformLookup(true), 2500)

    return () => clearTimeout(timeoutRef.current)
  }, [])

  if (lazyLoad && !shouldPerformLookup) {
    return <LoadingIndicator />
  }

  if (lazyLoad) {
    return (
      <LazyLoad placeholder={<LoadingIndicator />}>
        <Tags />
      </LazyLoad>
    )
  }
  return <Tags />
}
