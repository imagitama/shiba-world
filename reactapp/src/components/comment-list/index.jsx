import React from 'react'
import Comment from '../comment'
import LoadingIndicator from '../loading-indicator'
import useDatabaseQuery, {
  CollectionNames,
  CommentFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import ErrorMessage from '../error-message'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'

export default ({ collectionName, parentId }) => {
  if (!collectionName) {
    throw new Error('Cannot render comment list: no collection name!')
  }
  if (!parentId) {
    throw new Error('Cannot render comment list: no parent ID')
  }

  const [parentDoc] = useDatabaseDocument(collectionName, parentId)
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Comments,
    [[CommentFieldNames.parent, Operators.EQUALS, parentDoc]]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load comments</ErrorMessage>
  }

  if (!results.length) {
    return 'No comments found :('
  }

  return (
    <>
      {results.map(result => (
        <Comment key={result.id} comment={result} />
      ))}
    </>
  )
}
