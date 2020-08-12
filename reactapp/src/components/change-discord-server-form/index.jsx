import React, { useEffect, useState } from 'react'
import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'

import TextInput from '../text-input'
import Button from '../button'

import useDatabaseQuery, { CollectionNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

function DiscordServerIds() {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.DiscordServers
  )

  if (isLoading) {
    return 'Loading...'
  }

  if (isErrored || !results || !results.length) {
    return 'Error!'
  }

  return (
    <span>
      {results.map(result => (
        <span key={result.id}>
          {result.name} - {result.id}
          <br />
        </span>
      ))}
    </span>
  )
}

export default ({ collectionName, id, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(collectionName, id)
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [discordServerIdValue, setDiscordServerIdValue] = useState(null)

  useEffect(() => {
    if (!result) {
      return
    }

    const { ownedBy } = result

    if (!ownedBy) {
      return
    }

    setDiscordServerIdValue(ownedBy.id)
  }, [result === null])

  if (!userId) {
    return 'You are not logged in'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (isError) {
    return 'Error loading resource'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Discord server has been changed'
  }

  if (isFailed) {
    return 'Error saving new Discord server'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save discord server button', id)

      const newValue = discordServerIdValue
        ? createRef(CollectionNames.DiscordServers, discordServerIdValue)
        : null

      await save({
        discordServer: newValue,
        lastModifiedAt: new Date(),
        lastModifiedBy: createRef(CollectionNames.Users, userId)
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  if (!isEditorOpen) {
    return (
      <Button
        onClick={() => setIsEditorOpen(true)}
        color="default"
        icon={<DiscordIcon />}>
        Change Discord Server
      </Button>
    )
  }

  return (
    <>
      <DiscordServerIds />
      Enter a new Discord server ID:
      <TextInput
        onChange={e => setDiscordServerIdValue(e.target.value)}
        value={discordServerIdValue}
      />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
