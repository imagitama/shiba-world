import React, { useState } from 'react'
import { callFunction } from '../../firebase'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import Heading from '../heading'
import Button from '../button'
import useDatabaseQuery from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

export default () => {
  const userId = useFirebaseUserId()
  const [username, setUsername] = useState('PeanutBuddha')
  const [isLookingUpUsername, setIsLookingUpUsername] = useState(false)
  const [isLoading, isErrored, result] = useDatabaseQuery(
    'vrchatStatuses',
    userId
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to talk to database</ErrorMessage>
  }

  const onSubmitClick = async () => {
    try {
      setIsLookingUpUsername(true)
      const lookupResult = await callFunction('lookupVrchatUsername', {
        username
      })
      console.log(lookupResult)
      setIsLookingUpUsername(false)
    } catch (err) {
      console.error(err)
    }
  }

  if (isLookingUpUsername) {
    return <LoadingIndicator message="Looking up username..." />
  }

  return (
    <>
      <Heading variant="h2">Connect your VRChat account</Heading>
      {!result ? (
        <>
          Enter your username to get started:{' '}
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <br />
          <br />
          <Button onClick={onSubmitClick}>Submit</Button>
        </>
      ) : (
        `You have successfully connected your account. Your status: ${JSON.stringify(
          result
        )}`
      )}
    </>
  )
}
