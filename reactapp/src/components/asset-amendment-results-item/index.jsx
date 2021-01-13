import React from 'react'
import { Link } from 'react-router-dom'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import CloseIcon from '@material-ui/icons/Close'
import CheckIcon from '@material-ui/icons/Check'

import {
  CollectionNames,
  AssetAmendmentFieldNames,
  AssetFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'
import * as routes from '../../routes'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import LoadingIndicator from '../loading-indicator'
import FormattedDate from '../formatted-date'
import TagChip from '../tag-chip'
import Button from '../button'

export default ({
  result,
  showControls = false,
  analyticsCategoryName = ''
}) => {
  const {
    id: amendmentId,
    [AssetAmendmentFieldNames.asset]: asset,
    [AssetAmendmentFieldNames.fields]: fields,
    [AssetAmendmentFieldNames.createdAt]: createdAt,
    [AssetAmendmentFieldNames.createdBy]: createdBy,
    [AssetAmendmentFieldNames.isRejected]: isRejected
  } = result

  const userId = useFirebaseUserId()

  const [
    isSavingAmendment,
    isSaveAmendmentSuccess,
    isSaveAmendmentError,
    saveAmendment
  ] = useDatabaseSave(CollectionNames.AssetAmendments, amendmentId)
  const [
    isSavingAsset,
    isSaveAssetSuccess,
    isSaveAssetError,
    saveAsset
  ] = useDatabaseSave(CollectionNames.Assets, asset.id)

  if (isSavingAmendment || isSavingAsset) {
    return (
      <TableRow>
        <TableCell>
          <LoadingIndicator message="Saving..." />
        </TableCell>
      </TableRow>
    )
  }

  if (isSaveAmendmentError || isSaveAssetError) {
    return (
      <TableRow>
        <TableCell>
          Failed to save amendment or asset - please try again later
        </TableCell>
      </TableRow>
    )
  }

  if (isSaveAmendmentSuccess && isSaveAssetSuccess) {
    return (
      <TableRow>
        <TableCell>
          Amendment has been applied successfully!
          <br />
          <br />
          <Button url={routes.viewAssetWithVar.replace(':assetId', asset.id)}>
            View Asset
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  const onApplyClick = async () => {
    try {
      trackAction(
        analyticsCategoryName,
        'Click apply asset amendment button',
        amendmentId
      )

      await saveAsset({
        ...fields,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      await saveAmendment({
        [AssetAmendmentFieldNames.isRejected]: false,
        [AssetAmendmentFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetAmendmentFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save asset with amendment fields', err)
      handleError(err)
    }
  }

  const onRejectClick = async () => {
    try {
      trackAction(
        analyticsCategoryName,
        'Click reject asset amendment button',
        amendmentId
      )

      await saveAmendment({
        [AssetAmendmentFieldNames.isRejected]: true,
        [AssetAmendmentFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetAmendmentFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save asset with amendment fields', err)
      handleError(err)
    }
  }

  return (
    <TableRow key={amendmentId} title={amendmentId}>
      <TableCell>
        <Link to={routes.viewAssetWithVar.replace(':assetId', asset.id)}>
          {asset[AssetFieldNames.title]}
        </Link>
      </TableCell>
      <TableCell>
        {fields[AssetFieldNames.tags]
          ? fields[AssetFieldNames.tags].map(tagName => (
              <TagChip key={tagName} tagName={tagName} />
            ))
          : '-'}
      </TableCell>
      <TableCell>
        <FormattedDate date={createdAt} /> by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
          {createdBy[UserFieldNames.username]}
        </Link>
      </TableCell>
      {showControls ? (
        <TableCell>
          <Button icon={<CheckIcon />} onClick={() => onApplyClick()}>
            Apply
          </Button>
          <Button
            icon={<CloseIcon />}
            onClick={() => onRejectClick()}
            color="default">
            Reject
          </Button>
        </TableCell>
      ) : (
        <TableCell>
          {isRejected === true
            ? 'Rejected'
            : isRejected === false
            ? 'Applied'
            : 'Pending'}
        </TableCell>
      )}
    </TableRow>
  )
}
