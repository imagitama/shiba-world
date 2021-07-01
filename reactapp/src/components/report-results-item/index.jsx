import React, { useState, Fragment } from 'react'
import { Link } from 'react-router-dom'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import CloseIcon from '@material-ui/icons/Close'
import CheckIcon from '@material-ui/icons/Check'
import ChatIcon from '@material-ui/icons/Chat'

import {
  CollectionNames,
  AssetFieldNames,
  UserFieldNames,
  ReportFieldNames
} from '../../hooks/useDatabaseQuery'
import { createRef } from '../../utils'
import * as routes from '../../routes'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'

import LoadingIndicator from '../loading-indicator'
import FormattedDate from '../formatted-date'
import Button from '../button'

export default ({
  report,
  showAssetDetails = true,
  showControls = false,
  analyticsCategoryName = ''
}) => {
  const {
    id: reportId,
    [ReportFieldNames.parent]: parent,
    [ReportFieldNames.comments]: comments,
    [ReportFieldNames.reason]: reason,
    [ReportFieldNames.createdAt]: createdAt,
    [ReportFieldNames.createdBy]: createdBy,
    [ReportFieldNames.isDeleted]: isDeleted,
    [ReportFieldNames.isVerified]: isVerified
  } = report

  const userId = useFirebaseUserId()
  const [
    isSavingReport,
    isSuccessSavingReport,
    isFailedSavingReport,
    saveReport
  ] = useDatabaseSave(CollectionNames.Reports, reportId)
  const [isCommentsVisible, setIsCommentsVisible] = useState(false)

  const onVerifyClick = async () => {
    try {
      trackAction(
        analyticsCategoryName,
        isVerified ? 'Click unverify button' : 'Click verify button',
        reportId
      )

      await saveReport({
        [ReportFieldNames.isVerified]: !isVerified,
        [ReportFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [ReportFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save report', err)
      handleError(err)
    }
  }

  const onDeleteClick = async () => {
    try {
      trackAction(
        analyticsCategoryName,
        isDeleted ? 'Click undelete button' : 'Click delete button',
        reportId
      )

      await saveReport({
        [ReportFieldNames.isDeleted]: !isDeleted,
        [ReportFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [ReportFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save report', err)
      handleError(err)
    }
  }

  return (
    <Fragment key={reportId}>
      <TableRow key={reportId} title={reportId}>
        {showAssetDetails && (
          <TableCell>
            <Link to={routes.viewAssetWithVar.replace(':assetId', parent.id)}>
              {parent[AssetFieldNames.title]}
            </Link>
          </TableCell>
        )}
        <TableCell>
          {reason}
          <br />
          <Button
            onClick={() => setIsCommentsVisible(currentVal => !currentVal)}
            size="small">
            Toggle Comments
          </Button>
        </TableCell>
        <TableCell>
          <FormattedDate date={createdAt} /> by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
            {createdBy[UserFieldNames.username]}
          </Link>
        </TableCell>
        <TableCell>
          {isDeleted ? 'Deleted' : isVerified ? 'Verified' : 'Pending'}
        </TableCell>
        {showControls ? (
          <TableCell>
            {isSavingReport ? (
              <LoadingIndicator />
            ) : (
              <>
                <Button icon={<CheckIcon />} onClick={() => onVerifyClick()}>
                  {isVerified ? 'Unverify' : 'Verify'}
                </Button>
                <Button
                  icon={<CloseIcon />}
                  onClick={() => onDeleteClick()}
                  color="default">
                  {isDeleted ? 'Undelete' : 'Delete'}
                </Button>
                {isFailedSavingReport
                  ? 'Failed to save'
                  : isSuccessSavingReport
                  ? 'Saved!'
                  : ''}
              </>
            )}
            <Button
              icon={<ChatIcon />}
              url={`${routes.viewConversationWithoutVar}?reportId=${reportId}`}
            />
          </TableCell>
        ) : null}
      </TableRow>
      {isCommentsVisible && (
        <TableRow>
          <TableCell colSpan={999}>{comments || '(no comments)'}</TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}
