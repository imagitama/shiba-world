import React, { useEffect, useState } from 'react'

import { createRef } from '../../utils'
import { UserFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { callFunction } from '../../firebase'
import { handleError } from '../../error-handling'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'
import useUserRecord from '../../hooks/useUserRecord'

const DiscordUserFieldNames = {
  username: 'username'
}

export default ({ userId, discordUser, onDone }) => {
  const [isLoadingUser, , user] = useUserRecord()
  const [isError, setIsError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [, , , create] = useDatabaseSave(CollectionNames.Users, userId)

  useEffect(() => {
    if (!userId || !discordUser || isLoadingUser) {
      return
    }

    // if user has already setup their profile then skip all this stuff
    if (user && user[UserFieldNames.username]) {
      console.debug(`user already created - skipping sync with discord`, user)
      onDone()
      return
    }

    async function main() {
      try {
        setIsError(false)
        setIsLoading(true)

        const {
          data: { optimizedImageUrl }
        } = await callFunction('downloadAndOptimizeDiscordAvatar', {
          userId: discordUser.id,
          avatarHash: discordUser.avatar
        })

        await create({
          [UserFieldNames.username]:
            discordUser[DiscordUserFieldNames.username],
          [UserFieldNames.avatarUrl]: optimizedImageUrl,
          [UserFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
          [UserFieldNames.createdAt]: new Date()
        })

        setIsError(false)
        setIsLoading(false)
        onDone()
      } catch (err) {
        setIsError(true)
        setIsLoading(false)
        console.error(err)
        handleError(err)
      }
    }

    main()
  }, [isLoadingUser])

  if (isError) {
    return (
      <ErrorMessage>
        Failed to use your Discord profile for your profile! You have logged in
        but your username and avatar has not been set
        <br />
        <br />
        <Button onClick={() => onDone()}>OK</Button>
      </ErrorMessage>
    )
  }

  if (isLoading) {
    return (
      <LoadingIndicator message="Setting your avatar and username to your Discord profile..." />
    )
  }

  return null
}
