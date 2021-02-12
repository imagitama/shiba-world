import React, { useEffect, useState } from 'react'
import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'

import Button from '../button'
import Paper from '../paper'

import useDatabaseQuery, {
  CollectionNames,
  options,
  DiscordServerFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

function DiscordServerIds({ onClickWithIdAndName }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.DiscordServers,
    undefined,
    {
      [options.queryName]: 'change-discord-server-form-ids'
    }
  )

  if (isLoading) {
    return 'Loading...'
  }

  if (isErrored || !results || !results.length) {
    return 'Error!'
  }

  return (
    <>
      Select a Discord server:
      <br />
      <br />
      {results.map(result => (
        <span key={result.id}>
          <Button
            color="default"
            onClick={() => onClickWithIdAndName(result.id, result.name)}>
            {result[DiscordServerFieldNames.name]}
          </Button>{' '}
        </span>
      ))}
    </>
  )
}

export default ({ collectionName, id, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(collectionName, id, {
    [options.queryName]: `change-discord-server-form`
  })
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    collectionName,
    id
  )
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [discordServerIdValue, setDiscordServerIdValue] = useState(null)
  const [discordServerName, setDiscordServerName] = useState(null)

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

  const onClickWithIdAndName = (id, name) => {
    setDiscordServerIdValue(id)
    setDiscordServerName(name)
  }

  if (!isEditorOpen) {
    return (
      <Button
        onClick={() => setIsEditorOpen(true)}
        color="tertiary"
        icon={<DiscordIcon />}>
        Change Discord Server
      </Button>
    )
  }

  return (
    <Paper>
      {discordServerName && (
        <>
          You have selected: {discordServerName}
          <br />
          <br />
        </>
      )}

      <DiscordServerIds onClickWithIdAndName={onClickWithIdAndName} />
      <br />
      <br />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </Paper>
  )
}
