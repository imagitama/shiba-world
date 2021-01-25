import React from 'react'
import Button from '../button'
import Paper from '../paper'
import TagInput from '../tag-input'

import useDatabaseQuery, {
  CollectionNames,
  AssetAmendmentFieldNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

export default ({
  assetId,
  actionCategory = '',
  onDone = null,
  onCancel = null
}) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.AssetAmendments
  )

  if (!userId) {
    return 'You are not logged in'
  }

  if (isLoading) {
    return 'Loading...'
  }

  if (isError || !result) {
    return 'Error loading resource'
  }

  if (isSaving) {
    return 'Creating amendment...'
  }

  if (isSuccess) {
    return 'Tag amendment has been submitted'
  }

  if (isFailed) {
    return 'Error creating amendment'
  }

  const onSaveBtnClick = async newTags => {
    try {
      trackAction(actionCategory, 'Click save tags editor button', assetId)

      await save({
        [AssetAmendmentFieldNames.isRejected]: null,
        [AssetAmendmentFieldNames.asset]: createRef(
          CollectionNames.Assets,
          assetId
        ),
        [AssetAmendmentFieldNames.fields]: {
          [AssetFieldNames.tags]: newTags
        },
        [AssetAmendmentFieldNames.createdAt]: new Date(),
        [AssetAmendmentFieldNames.createdBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <Paper>
      <p>Any logged in user can propose changes to the tags of an asset.</p>
      <p>View your amendments by going to My Account -> Amendments.</p>
      <p>
        View amendments made by other users by going to My Account -> Amendments
        or scroll to the bottom of an asset.
      </p>
      <TagInput
        currentTags={result[AssetFieldNames.tags]}
        onDone={newTags => onSaveBtnClick(newTags)}
      />{' '}
      <Button onClick={onCancel} color="default">
        Cancel
      </Button>
    </Paper>
  )
}
