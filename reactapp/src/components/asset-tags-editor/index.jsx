import React from 'react'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

import TagInput from '../tag-input'

export default ({ assetId, tags = [], onDone, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  const onSaveBtnClick = async newTags => {
    try {
      trackAction(actionCategory, 'Click save asset tags', assetId)

      await save({
        [AssetFieldNames.tags]: newTags,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset tags', err)
      handleError(err)
    }
  }

  return (
    <>
      <TagInput
        currentTags={tags}
        onDone={newTags => onSaveBtnClick(newTags)}
      />
      {isSaving
        ? 'Saving...'
        : isSaveSuccess
        ? 'Success!'
        : isSaveError
        ? 'Error'
        : null}
    </>
  )
}
