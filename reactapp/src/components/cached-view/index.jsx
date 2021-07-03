import React from 'react'
import { useParams } from 'react-router'
import SortControls from '../sort-controls'
import PagesNavigation from '../pages-navigation'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import LoadingIndicator from '../loading-indicator'

import useDatabaseQuery, {
  CollectionNames,
  mapDates
} from '../../hooks/useDatabaseQuery'
import useSorting from '../../hooks/useSorting'

const Page = ({ viewName, sortKey, defaultFieldName, renderer }) => {
  const [sorting] = useSorting(sortKey, defaultFieldName)
  const { pageNumber: currentPageNumber = 1 } = useParams()
  const [isLoading, isErrored, page] = useDatabaseQuery(
    CollectionNames.ViewCache,
    `${viewName}_${sorting.fieldName}_${
      sorting.direction
    }_page${currentPageNumber}`
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading page..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load page!</ErrorMessage>
  }

  const items = page ? page.items : []

  if (!items.length) {
    return <NoResultsMessage />
  }

  // 99% of views want this (maybe make a prop later)
  const itemsWithDates = items.map(mapDates)

  return React.cloneElement(renderer, { items: itemsWithDates })
}

export default ({
  viewName,
  sortKey = '',
  sortOptions = [],
  defaultFieldName = '',
  children,
  hidePageNumbersForSinglePage = true
}) => {
  if (!children) {
    throw new Error('Cannot render cached view without a renderer!')
  }

  const [sorting] = useSorting(sortKey, defaultFieldName)
  const [isLoading, isErrored, summary] = useDatabaseQuery(
    CollectionNames.ViewCache,
    `${viewName}_${sorting.fieldName}_${sorting.direction}_summary`
  )
  const { pageNumber: currentPageNumber = 1 } = useParams()

  if (isLoading) {
    return <LoadingIndicator message="Loading..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load!</ErrorMessage>
  }

  const { pageCount } = summary || { pageCount: 0 }

  return (
    <>
      {sortOptions.length ? (
        <SortControls
          options={sortOptions}
          sortKey={sortKey}
          defaultFieldName={defaultFieldName}
        />
      ) : null}
      <Page
        viewName={viewName}
        sortKey={sortKey}
        defaultFieldName={defaultFieldName}
        renderer={children}
      />
      {pageCount <= 1 && hidePageNumbersForSinglePage ? null : (
        <PagesNavigation
          pageCount={pageCount}
          currentPageNumber={currentPageNumber}
        />
      )}
    </>
  )
}
