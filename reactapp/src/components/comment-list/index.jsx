import React from 'react'

import Comment from '../comment'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'

import useDatabaseQuery, {
  CollectionNames,
  CommentFieldNames,
  Operators,
  OrderDirections
} from '../../hooks/useDatabaseQuery'

import { createRef } from '../../utils'

export default ({ collectionName, parentId }) => {
  if (!collectionName) {
    throw new Error('Cannot render comment list: no collection name!')
  }
  if (!parentId) {
    throw new Error('Cannot render comment list: no parent ID')
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Comments,
    [
      [
        CommentFieldNames.parent,
        Operators.EQUALS,
        createRef(collectionName, parentId)
      ]
    ],
    100,
    [CommentFieldNames.createdAt, OrderDirections.DESC],
    true,
    undefined,
    true
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load comments</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage>No comments found</NoResultsMessage>
  }

  return (
    <>
      {results.map(result => (
        <Comment key={result.id} comment={result} />
      ))}
    </>
  )
}
