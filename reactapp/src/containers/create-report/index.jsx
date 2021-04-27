import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'

import ErrorMessage from '../../components/error-message'
import NoPermissionMessage from '../../components/no-permission-message'
import SuccessMessage from '../../components/success-message'
import Message, { types } from '../../components/message'
import LoadingIndicator from '../../components/loading-indicator'
import Button from '../../components/button'
import Heading from '../../components/heading'
import TextInput from '../../components/text-input'
import FormControls from '../../components/form-controls'

import useDatabaseQuery, {
  CollectionNames,
  RequestsFieldNames,
  ReportFieldNames,
  AssetFieldNames,
  ReportReasons
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import * as routes from '../../routes'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import { DISCORD_URL } from '../../config'
import { Link } from 'react-router-dom'

const analyticsCategory = 'CreateReport'

const useStyles = makeStyles({
  input: { width: '100%', marginBottom: '1rem' }
})

const reasons = [
  {
    value: ReportReasons.BROKEN_SOURCE,
    label: 'Broken or invalid source'
  },
  {
    value: ReportReasons.OUTDATED_CONTENT,
    label: 'Outdated content (eg. thumbnail, attachments, etc.)'
  },
  {
    value: ReportReasons.OFFENSIVE_CONTENT,
    label: 'Offensive content'
  },
  {
    value: ReportReasons.SPAM,
    label: 'Spam or bot message'
  },
  {
    value: ReportReasons.OTHER,
    label: 'Other/custom reason (use comments field)'
  }
]

export default () => {
  const userId = useFirebaseUserId()
  const { assetId } = useParams()
  const [isLoadingAsset, isErrorLoadingAsset, asset] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Reports
  )
  const [fieldData, setFieldData] = useState({
    [ReportFieldNames.reason]: null,
    [ReportFieldNames.comments]: ''
  })
  const [, setCreatedDocId] = useState(null)
  const classes = useStyles()

  if (!userId) {
    return <NoPermissionMessage />
  }

  if (isSaving || isLoadingAsset || !asset) {
    return <LoadingIndicator />
  }

  if (isErrorLoadingAsset) {
    return (
      <ErrorMessage>Failed to load form - asset failed to load</ErrorMessage>
    )
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to create the report</ErrorMessage>
  }

  if (isSaveSuccess) {
    return (
      <SuccessMessage>
        Report created successfully
        <br />
        <br />A member of the staff will review your report as soon as possible.
        You can also join our <a href={DISCORD_URL}>Discord server</a> to ask
        for more help.
        <br />
        <br />
        {/* <Button
          url={routes.viewReportWithVar.replace(':reportId', createdDocId)}
          onClick={() =>
            trackAction(
              analyticsCategory,
              'Click view created report button',
              createdDocId
            )
          }>
          View Report
        </Button>{' '} */}
        <Button
          url={routes.viewAssetWithVar.replace(':assetId', assetId)}
          onClick={() =>
            trackAction(
              analyticsCategory,
              'Click return to asset button',
              assetId
            )
          }>
          Return To Asset
        </Button>
      </SuccessMessage>
    )
  }

  const onFieldChange = (fieldName, newValue) =>
    setFieldData({
      ...fieldData,
      [fieldName]: newValue
    })

  const onCreateBtnClick = async () => {
    trackAction(analyticsCategory, 'Click create report button')

    // TODO: Output this invalid data to user
    if (!fieldData[ReportFieldNames.reason]) {
      return false
    }

    try {
      const [newDocId] = await save({
        ...fieldData,
        [ReportFieldNames.parent]: createRef(CollectionNames.Assets, assetId),
        // Need to populate these for queries later
        [ReportFieldNames.isDeleted]: false,
        [ReportFieldNames.isVerified]: false,
        [ReportFieldNames.createdBy]: createRef(CollectionNames.Users, userId),
        [ReportFieldNames.createdAt]: new Date()
      })

      setCreatedDocId(newDocId)
    } catch (err) {
      console.error('Failed to create request', err)
      handleError(err)
    }
  }

  return (
    <>
      <Helmet>
        <title>Create a new report | VRCArena</title>
        <meta
          name="description"
          content="Use this form to create a new report."
        />
      </Helmet>
      <Heading variant="h1">Create Report</Heading>
      <p>
        Use this form to create a new report for the asset "
        {asset[AssetFieldNames.title]}".
      </p>
      <Message type={types.WARNING}>
        Do you want to submit a DMCA copyright claim? Please read our{' '}
        <Link to={routes.dmcaPolicy}>DMCA policy</Link>.
      </Message>
      Reason
      <Select
        className={classes.input}
        value={fieldData[ReportFieldNames.reason]}
        variant="outlined"
        onChange={e => onFieldChange(ReportFieldNames.reason, e.target.value)}>
        {reasons.map(reason => (
          <MenuItem key={reason.value} value={reason.value}>
            {reason.label}
          </MenuItem>
        ))}
      </Select>
      Comments
      <TextInput
        className={classes.input}
        onChange={e => onFieldChange(ReportFieldNames.comments, e.target.value)}
        multiline
        rows={5}
      />
      <FormControls>
        <Button onClick={onCreateBtnClick}>Create</Button>
      </FormControls>
    </>
  )
}
