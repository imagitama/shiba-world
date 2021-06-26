import React from 'react'
import useDatabaseQuery, {
  CollectionNames,
  Operators,
  options,
  PrivateMessageFieldNames
} from '../../../../hooks/useDatabaseQuery'
import useUserRecord from '../../../../hooks/useUserRecord'
import { canApproveAsset, createRef } from '../../../../utils'
import NoResultsMessage from '../../../no-results-message'
import PrivateMessages from '../../../private-messages'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import CreatePrivateMessageForm from '../../../create-private-message-form'

export default ({ assetId, createdBy }) => {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.PrivateMessages,
    [
      [
        PrivateMessageFieldNames.relatedEntity,
        Operators.EQUALS,
        createRef(CollectionNames.Assets, assetId)
      ]
    ],
    { [options.populateRefs]: true }
  )
  const [, , user] = useUserRecord()
  const isApprover = canApproveAsset(user)

  if (!results || isLoading) {
    return <LoadingIndicator message="Find messages for this asset..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load messages</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  const lastMessage = results[0]

  return (
    <>
      <PrivateMessages messages={results} />
      <CreatePrivateMessageForm
        recipientId={
          isApprover
            ? createdBy.id
            : lastMessage[PrivateMessageFieldNames.createdBy].id
        }
        relatedEntityCollectionName={CollectionNames.Assets}
        relatedEntityId={assetId}
      />
    </>
  )
}
