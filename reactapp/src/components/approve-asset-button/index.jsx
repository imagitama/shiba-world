import React, { useEffect, useState } from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'
import TextInput from '../text-input'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

// pass isAlreadyApproved to save on database query
export default ({ assetId, isAlreadyApproved = null, onClick = null }) => {
  const userId = useFirebaseUserId()
  const [isLoadingAsset, isErroredLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId,
    {
      [options.queryName]: 'approve-asset-btn',
      [options.subscribe]: true
    }
  )
  const [isSaving, , isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [unapprovedReason, setUnapprovedReason] = useState(
    asset ? asset[AssetFieldNames.unapprovedReason] : ''
  )
  const [isUnapprovedReasonVisible, setIsUnapprovedReasonVisible] = useState(
    false
  )

  useEffect(() => {
    if (!asset || !asset[AssetFieldNames.unapprovedReason]) {
      return
    }
    setUnapprovedReason(asset[AssetFieldNames.unapprovedReason])
  }, [asset !== null])

  if (!userId || isLoadingAsset) {
    return <>Loading...</>
  }

  if (isSaving) {
    return <>Saving...</>
  }

  if (isErroredLoadingAsset) {
    return <>Failed to load asset</>
  }

  if (isSaveError) {
    return <>Failed to save</>
  }

  const isApproved = asset
    ? asset[AssetFieldNames.isApproved]
    : isAlreadyApproved

  const unapprove = async () => {
    try {
      if (onClick) {
        onClick({ newValue: false })
      }

      await save({
        [AssetFieldNames.isApproved]: false,
        [AssetFieldNames.isPrivate]: true,
        [AssetFieldNames.unapprovedReason]: unapprovedReason,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      setIsUnapprovedReasonVisible(false)
    } catch (err) {
      console.error('Failed to unapprove asset', err)
      handleError(err)
    }
  }

  const approve = async () => {
    try {
      const newValue = true

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
      console.error('Failed to approve asset', err)
      handleError(err)
    }
  }

  if (isUnapprovedReasonVisible) {
    return (
      <>
        Reason:
        <br />
        <TextInput
          multiline
          rows={5}
          value={unapprovedReason}
          onChange={e => setUnapprovedReason(e.target.value)}
        />
        <br />
        <Button color="primary" onClick={unapprove} icon={<CheckIcon />}>
          Done
        </Button>{' '}
        (user is notified and marks as unpublished)
        <br />
        <Button
          color="default"
          onClick={() => setIsUnapprovedReasonVisible(false)}>
          Cancel
        </Button>
      </>
    )
  }

  return (
    <>
      Status: <strong>{isApproved ? 'Approved' : 'Unapproved'}</strong>
      <br />
      {asset && asset[AssetFieldNames.unapprovedReason] && !isApproved ? (
        <>
          Reason: {asset[AssetFieldNames.unapprovedReason]}
          <br />
        </>
      ) : null}
      <Button color="default" onClick={approve} icon={<CheckIcon />}>
        Approve
      </Button>
      <br />
      <Button
        color="default"
        onClick={() => setIsUnapprovedReasonVisible(true)}
        icon={<ClearIcon />}>
        Unapprove...
      </Button>
    </>
  )
}
