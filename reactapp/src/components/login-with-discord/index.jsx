import React, { useEffect, useState } from 'react'
import firebase from 'firebase'

import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import SyncUserWithDiscordForm from '../sync-user-with-discord-form'

// when you log in this component gets completely remounted so it tries to repeat a bunch of times
let isAlreadyAuthenticated = false

export default ({ code, onSuccess, onFail }) => {
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [discordUser, setDiscordUser] = useState(null)

  useEffect(() => {
    if (!code || isAlreadyAuthenticated) {
      return
    }

    async function main() {
      try {
        setIsError(false)
        setIsLoading(true)
        setIsSuccess(false)

        const {
          data: { token, discordUser: user }
        } = await callFunction('loginWithDiscord', {
          code
        })

        const {
          user: loggedInUser
        } = await firebase.auth().signInWithCustomToken(token)

        // the user might not have an email OR the email might already be taken so just ignore errors
        // TODO: Check against existing emails?
        try {
          await loggedInUser.updateEmail(user.email)
        } catch (err) {
          console.log(err)
        }

        isAlreadyAuthenticated = true

        setIsError(false)
        setIsLoading(false)
        setIsSuccess(true)
        setDiscordUser(user)
      } catch (err) {
        console.error(err)
        handleError(err)
        setIsError(true)
        setIsLoading(false)
      }
    }

    main()
  }, [code])

  if (isError) {
    return (
      <ErrorMessage>
        Failed to get your details from Discord
        <br />
        <br />
        <Button onClick={() => onFail()}>Try Again</Button>
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading your Discord details..." />
  }

  if (isSuccess && discordUser) {
    return (
      <SyncUserWithDiscordForm
        userId={discordUser.id}
        discordUser={discordUser}
        onDone={onSuccess}
      />
    )
  }

  return null
}
