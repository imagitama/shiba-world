import React, { useState } from 'react'
import Button from '../button'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { searchIndexNames } from '../../modules/app'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

import SearchForIdForm from '../search-for-id-form'

const analyticsCategoryName = 'ViewAssetEditor'

export default ({ assetId, clonableWorld = null, onDone }) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [newClonableWorldId, setNewClonableWorldId] = useState(
    clonableWorld ? clonableWorld.id : null
  )

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Asset saved successfully'
  }

  if (isFailed) {
    return 'Error saving author'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(
        analyticsCategoryName,
        'Click save clonable world editor button',
        assetId
      )

      await save({
        [AssetFieldNames.clonableWorld]: createRef(
          CollectionNames.Assets,
          newClonableWorldId
        ),
        lastModifiedAt: new Date(),
        lastModifiedBy: createRef(CollectionNames.Users, userId)
      })

      onDone()
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      {newClonableWorldId && `You have selected: ${newClonableWorldId}`}

      <SearchForIdForm
        indexName={searchIndexNames.ASSETS}
        fieldAsLabel={AssetFieldNames.title}
        onDone={(id, searchResult) => {
          setNewClonableWorldId(id)
        }}
      />

      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
