import React from 'react'
import CheckIcon from '@material-ui/icons/Check'
import ClearIcon from '@material-ui/icons/Clear'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  control: {
    marginTop: '0.25rem'
  },
  status: {
    textAlign: 'center'
  },
  approved: {
    color: 'green'
  },
  unapproved: {
    color: 'red'
  }
})

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
  const classes = useStyles()

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
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })
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

  return (
    <>
      <div
        className={`${classes.status} ${
          isApproved ? classes.approved : classes.unapproved
        }`}>
        Status: <strong>{isApproved ? 'Approved' : 'Unapproved'}</strong>
      </div>
      <div className={classes.control}>
        <Button color="default" onClick={approve} icon={<CheckIcon />}>
          Approve
        </Button>
      </div>
      <div className={classes.control}>
        <Button color="default" onClick={unapprove} icon={<ClearIcon />}>
          Unapprove
        </Button>
      </div>
    </>
  )
}
