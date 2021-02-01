import React from 'react'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

// pass isAlreadyApproved to save on database query
export default ({ assetId, isAlreadyApproved = null, onClick = null }) => {
  const userId = useFirebaseUserId()
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    isAlreadyApproved !== null ? false : assetId
  )
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )

  if (!userId || isLoadingAsset || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingAsset || isSaveError) {
    return <Button disabled>Error</Button>
  }

  const isApproved = asset
    ? asset[AssetFieldNames.isApproved]
    : isAlreadyApproved

  const onBtnClick = async () => {
    try {
      const newValue = !isApproved

      if (onClick) {
        onClick({ newValue })
      }

      await save({
        [AssetFieldNames.isApproved]: newValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to approve or unapprove asset', err)
      handleError(err)
    }
  }

  return (
    <Button color="default" onClick={onBtnClick}>
      {isApproved ? 'Unapprove' : 'Approve'}
    </Button>
  )
}
