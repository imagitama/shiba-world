import React from 'react'

import Comment from '../comment'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDatabaseQuery, {
  CollectionNames,
  CommentFieldNames,
  Operators,
  OrderDirections,
  options
} from '../../hooks/useDatabaseQuery'

import { createRef } from '../../utils'

export default ({ comments = null, collectionName, parentId }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Comments,
    comments
      ? false
      : [
          [
            CommentFieldNames.parent,
            Operators.EQUALS,
            createRef(collectionName, parentId)
          ]
        ],
    {
      [options.limit]: 100,
      [options.orderBy]: [CommentFieldNames.createdAt, OrderDirections.DESC],
      [options.subscribe]: true,
      [options.populateRefs]: true,
      [options.queryName]: 'comment-list'
    }
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load comments</ErrorMessage>
  }

  if ((results && !results.length) || (comments && !comments.length)) {
    return <NoResultsMessage>No comments found</NoResultsMessage>
  }

  return (
    <>
      {(comments || results).map(result => (
        <Comment key={result.id} comment={result} />
      ))}
    </>
  )
}
