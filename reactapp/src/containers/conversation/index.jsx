import React, { useState } from 'react'
import { useParams } from 'react-router'
import { makeStyles } from '@material-ui/core'
import useDatabaseQuery, {
  AssetFieldNames,
  CollectionNames,
  ConversationFieldNames,
  Operators,
  options,
  OrderDirections,
  PrivateMessageFieldNames,
  UserFieldNames,
  mapDates
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import { canApproveAsset, createRef } from '../../utils'
import ErrorMessage from '../../components/error-message'
import PrivateMessages from '../../components/private-messages'
import LoadingIndicator from '../../components/loading-indicator'
import NoResultsMessage from '../../components/no-results-message'
import CreatePrivateMessageForm from '../../components/create-private-message-form'
import AssetResultsItem from '../../components/asset-results-item'
import NoPermissionMessage from '../../components/no-permission-message'
import Button from '../../components/button'
import Avatar, { sizes } from '../../components/avatar'
import FormControls from '../../components/form-controls'
import ReportResultsItem from '../../components/report-results-item'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { useEffect } from 'react'

const useStyles = makeStyles({
  relatedEntity: {
    marginBottom: '2rem',
    '& > table': {
      width: '100%'
    }
  },
  info: {
    display: 'flex',
    alignItems: 'center',
    margin: '1rem 0'
  },
  label: {
    fontWeight: 'bold',
    marginRight: '2rem'
  },
  members: {
    display: 'flex'
  },
  member: {
    marginRight: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column'
  },
  username: {
    fontSize: '75%',
    marginTop: '0.25rem'
  }
})

const getCollectionNameForRelatedEntity = relatedEntity => {
  if (!relatedEntity) {
    return ''
  }
  if (relatedEntity.parentPath) {
    return relatedEntity.parentPath
  }
  if (relatedEntity.refPath) {
    return relatedEntity.refPath.split('/')[0]
  }
  if (relatedEntity.parent && relatedEntity.parent.path) {
    return relatedEntity.parent.path
  }
  return ''
}

function RelatedEntity({ relatedEntity }) {
  const classes = useStyles()
  return (
    <div className={classes.relatedEntity}>
      <RelatedEntityContent relatedEntity={relatedEntity} />
    </div>
  )
}

function RelatedEntityContent({ relatedEntity }) {
  const collectionName = getCollectionNameForRelatedEntity(relatedEntity)

  switch (collectionName) {
    case CollectionNames.Assets:
      return (
        <div>
          <AssetResultsItem asset={mapDates(relatedEntity)} isLandscape />
        </div>
      )

    case CollectionNames.Reports:
      return (
        <table>
          <ReportResultsItem report={mapDates(relatedEntity)} />
        </table>
      )

    default:
      throw new Error(
        `Cannot render related entity: collection name "${collectionName}" not configured`
      )
  }
}

function getRelatedEntityCreatorRef(relatedEntity) {
  if (!relatedEntity) {
    return null
  }

  const collectionName = getCollectionNameForRelatedEntity(relatedEntity)

  switch (collectionName) {
    case CollectionNames.Assets:
      if (relatedEntity[AssetFieldNames.ownedBy]) {
        return createRef(
          CollectionNames.Users,
          relatedEntity[AssetFieldNames.ownedBy].id
        )
      } else {
        return createRef(
          CollectionNames.Users,
          relatedEntity[AssetFieldNames.createdBy].id
        )
      }

    default:
      // assume this field is on there
      return createRef(CollectionNames.Users, relatedEntity.createdBy.id)
  }
}

function CreateConversationForm({ relatedEntity, onCreateWithId }) {
  const [isSaving, isSuccessSaving, isErrorSaving, save] = useDatabaseSave(
    CollectionNames.Conversations
  )
  const userId = useFirebaseUserId()

  if (!userId) {
    throw new Error('No user ID!')
  }

  const relatedEntityCreatorRef = getRelatedEntityCreatorRef(relatedEntity)

  const onClick = async () => {
    try {
      const [conversationId] = await save({
        [ConversationFieldNames.members]: [
          createRef(CollectionNames.Users, userId)
        ].concat(
          relatedEntityCreatorRef && relatedEntityCreatorRef.ref.id !== userId
            ? [relatedEntityCreatorRef]
            : []
        ),
        [ConversationFieldNames.relatedEntity]:
          createRef(
            getCollectionNameForRelatedEntity(relatedEntity),
            relatedEntity.id
          ) || null,
        [ConversationFieldNames.createdAt]: new Date(),
        [ConversationFieldNames.createdBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      onCreateWithId(conversationId)
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator message="Creating conversation..." />
  }

  if (isErrorSaving) {
    return <ErrorMessage>Failed to create conversation</ErrorMessage>
  }

  if (isSuccessSaving) {
    // this form should disappear
    return null
  }

  return (
    <FormControls>
      <Button onClick={onClick}>Start Conversation</Button>
    </FormControls>
  )
}

function MessagesForConversation({ conversationId }) {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.PrivateMessages,
    conversationId
      ? [
          [
            PrivateMessageFieldNames.conversation,
            Operators.EQUALS,
            createRef(CollectionNames.Conversations, conversationId)
          ]
        ]
      : false,
    {
      [options.populateRefs]: true,
      [options.subscribe]: true,
      [options.orderBy]: [
        PrivateMessageFieldNames.createdAt,
        OrderDirections.ASC
      ]
    }
  )

  if (!results || isLoading) {
    return <LoadingIndicator message="Loading messages..." />
  }

  if (isError) {
    return <ErrorMessage>Failed to load messages</ErrorMessage>
  }

  return results.length ? (
    <PrivateMessages messages={results} />
  ) : (
    <NoResultsMessage>No messages in this conversation yet</NoResultsMessage>
  )
}

function ConversationInfo({
  conversation: { [ConversationFieldNames.members]: members = [] }
}) {
  const classes = useStyles()
  return (
    <div className={classes.info}>
      <div className={classes.label}>Members</div>
      <div className={classes.members}>
        {members.length
          ? members.map(member => (
              <div key={member.id} className={classes.member}>
                <Avatar
                  url={member[UserFieldNames.avatarUrl]}
                  size={sizes.TINY}
                />
                <div className={classes.username}>
                  {member[UserFieldNames.username] || '(no name)'}
                </div>
              </div>
            ))
          : 'No participants!'}
      </div>
    </div>
  )
}

function Conversation({
  conversationId: providedConversationId,
  relatedEntityCollectionName,
  relatedEntityId
}) {
  const [conversationId, setConversationId] = useState(
    providedConversationId || null
  )

  const [isLoading, isError, conversationOrConversations] = useDatabaseQuery(
    CollectionNames.Conversations,
    providedConversationId
      ? providedConversationId
      : relatedEntityCollectionName && relatedEntityId
      ? [
          [
            ConversationFieldNames.relatedEntity,
            Operators.EQUALS,
            createRef(relatedEntityCollectionName, relatedEntityId)
          ]
        ]
      : false,
    {
      [options.populateRefs]: true,
      [options.subscribe]: true
    }
  )

  const conversation =
    Array.isArray(conversationOrConversations) &&
    conversationOrConversations.length
      ? conversationOrConversations[0]
      : conversationOrConversations

  const [
    isLoadingRelatedEntity,
    isErrorLoadingRelatedEntity,
    relatedEntityFromDb
  ] = useDatabaseQuery(relatedEntityCollectionName, relatedEntityId || false)

  const relatedEntity =
    conversation && conversation[ConversationFieldNames.relatedEntity]
      ? conversation[ConversationFieldNames.relatedEntity]
      : relatedEntityFromDb

  useEffect(() => {
    if (!conversation) {
      return
    }

    setConversationId(conversation.id)
  }, [providedConversationId, conversation !== null])

  return (
    <>
      {relatedEntity && <RelatedEntity relatedEntity={relatedEntity} />}
      {isLoading && <LoadingIndicator message="Loading conversation..." />}
      {isError && <ErrorMessage>Failed to load conversation!</ErrorMessage>}
      {conversation && <ConversationInfo conversation={conversation} />}
      {conversationId ? (
        <>
          <MessagesForConversation conversationId={conversationId} />
          <CreatePrivateMessageForm conversationId={conversationId} />
        </>
      ) : !isLoading && !isError ? (
        <CreateConversationForm
          onCreateWithId={newConversationId => {
            setConversationId(newConversationId)
          }}
          relatedEntity={relatedEntity}
        />
      ) : null}
    </>
  )
}

const getQueryParam = name => {
  // eslint-disable-next-line
  const url = new URL(location.href)
  return url.searchParams.get(name)
}

const getAssetIdFromQueryParams = () => getQueryParam('assetId')
const getReportIdFromQueryParams = () => getQueryParam('reportId')

export default () => {
  const { conversationId } = useParams()
  const userId = useFirebaseUserId()

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (!conversationId) {
    const assetId = getAssetIdFromQueryParams()

    if (!assetId) {
      // need way more future proof way of doing this!
      const reportId = getReportIdFromQueryParams()

      if (!reportId) {
        return <ErrorMessage>Need either a valid ID</ErrorMessage>
      }

      return (
        <Conversation
          relatedEntityCollectionName={CollectionNames.Reports}
          relatedEntityId={reportId}
        />
      )
    }

    return (
      <Conversation
        relatedEntityCollectionName={CollectionNames.Assets}
        relatedEntityId={assetId}
      />
    )
  }

  return <Conversation conversationId={conversationId} />
}
