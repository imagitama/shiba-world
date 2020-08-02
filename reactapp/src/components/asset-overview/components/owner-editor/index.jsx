import React, { useEffect, useState } from 'react'

import TextInput from '../../../text-input'
import Button from '../../../button'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames
} from '../../../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../../../hooks/useFirebaseUserId'

import { handleError } from '../../../../error-handling'
import { trackAction } from '../../../../analytics'
import { createRef } from '../../../../utils'

export default ({ assetId }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [ownerUserIdValue, setOwnerUserIdValue] = useState(null)

  useEffect(() => {
    if (!asset) {
      return
    }

    const { [AssetFieldNames.ownedBy]: ownedBy } = asset

    if (!ownedBy) {
      return
    }

    setOwnerUserIdValue(ownedBy.id)
  }, [asset === null])

  if (!userId) {
    return 'You are not logged in'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (isError) {
    return 'Error loading asset'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Owner has been changed'
  }

  if (isFailed) {
    return 'Error saving new owner'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction('ViewAsset', 'Click save new owner button', assetId)

      const newValue = ownerUserIdValue
        ? createRef(CollectionNames.Users, ownerUserIdValue)
        : null

      await save({
        [AssetFieldNames.ownedBy]: newValue,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      Enter a new owner user ID:
      <TextInput
        onChange={e => setOwnerUserIdValue(e.target.value)}
        value={ownerUserIdValue}
      />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
