import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import {
  PrivateMessageFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import { searchIndexNames } from '../../modules/app'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import LoadingIndicator from '../loading-indicator'
import SuccessMessage from '../success-message'
import ErrorMessage from '../error-message'
import TextInput from '../text-input'
import Button from '../button'
import SearchForIdForm from '../search-for-id-form'
import Avatar, { sizes } from '../avatar'
import FormControls from '../form-controls'

const useStyles = makeStyles({
  root: {},
  label: {
    marginLeft: 'auto',
    marginRight: '2rem'
  },
  user: {
    marginRight: 'auto'
  },
  inner: {
    width: '50%',
    margin: '0 auto'
  },
  input: {
    marginTop: '1rem',
    width: '100%'
  },
  recipient: {
    display: 'flex',
    alignItems: 'center'
  },
  username: {
    marginTop: '0.25rem',
    fontSize: '125%',
    textAlign: 'center'
  },
  hint: {
    fontSize: '75%'
  }
})

// function Recipient({ userId, user: overrideUser = null }) {
//     const [user, setUser] = useState(overrideUser)
//     const classes = useStyles()

//     return (
//         <div className={classes.recipient}>
//             <div className={classes.label}>
//                 Recipient:
//             </div>
//             <div className={classes.user}>
//                 <Avatar url={user[UserFieldNames.avatarUrl]} size={sizes.SMALL} />
//                 <div className={classes.username}>{user[UserFieldNames.username] || '(no recipient)'}</div>
//             </div>
//         </div>
//     )
// }

export default ({ conversationId }) => {
  if (!conversationId) {
    throw new Error(
      'Cannot render create private message form without a conversation ID!'
    )
  }

  const [message, setMessage] = useState('')
  // const [recipientId, setRecipientId] = useState(overrideRecipientId)
  // const [recipientUser, setRecipientUser] = useState(overrideRecipientUser)
  const [isSaving, isSaveSuccess, isSaveFailed, save] = useDatabaseSave(
    CollectionNames.PrivateMessages
  )
  const classes = useStyles()
  const userId = useFirebaseUserId()

  // useEffect(() => {
  //     if (!overrideRecipientUser) {
  //         return
  //     }
  //     setRecipientUser(overrideRecipientUser)
  // }, [overrideRecipientUser !== null])

  const send = async () => {
    try {
      if (!message) {
        console.warn('Cannot send private message without message')
        return
      }

      await save({
        [PrivateMessageFieldNames.conversation]: createRef(
          CollectionNames.Conversations,
          conversationId
        ),
        [PrivateMessageFieldNames.message]: message,
        // [PrivateMessageFieldNames.recipient]: recipientId ? createRef(CollectionNames.Users, recipientId) : null,
        [PrivateMessageFieldNames.createdAt]: new Date(),
        [PrivateMessageFieldNames.createdBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      setMessage('')
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (isSaving) {
    return <LoadingIndicator message="Sending..." />
  }

  // if (isSaveSuccess) {
  //     return <SuccessMessage>Message has been sent successfully</SuccessMessage>
  // }

  if (isSaveFailed) {
    return <ErrorMessage>Failed to send message</ErrorMessage>
  }

  return (
    <div className={classes.root}>
      <div className={classes.inner}>
        {/* {recipientUser ? <Recipient userId={recipientId} user={recipientUser} /> : <SearchForIdForm indexName={searchIndexNames.USERS} fieldAsLabel={UserFieldNames.username} onDone={(userId, user) => { 
                    setRecipientId(userId)
                    setRecipientUser(user)
                }}  />} */}
        <TextInput
          value={message}
          onChange={e => setMessage(e.target.value)}
          multiline
          rows={5}
          className={classes.input}
        />
        <span className={classes.hint}>Markdown supported</span>
        <FormControls>
          <Button onClick={send}>Send</Button>
        </FormControls>
      </div>
    </div>
  )
}
