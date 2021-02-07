import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  EndorsementFieldNames,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  loggedOutBtn: {
    cursor: 'not-allowed',
    opacity: 1
  }
})

export default ({ assetId, endorsementCount = '???', onClick = null }) => {
  const userId = useFirebaseUserId()
  const [, , myEndorsements] = useDatabaseQuery(
    CollectionNames.Endorsements,
    userId
      ? [
          [
            EndorsementFieldNames.createdBy,
            Operators.EQUALS,
            createRef(CollectionNames.Users, userId)
          ]
        ]
      : false,
    {
      [options.queryName]: 'get-my-endorsements'
    }
  )
  const [isSaving, isSavingSuccess, isSavingError, save] = useDatabaseSave(
    CollectionNames.Endorsements
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      if (onClick) {
        onClick({
          newValue: true
        })
      }

      await save({
        [EndorsementFieldNames.asset]: createRef(
          CollectionNames.Assets,
          assetId
        ),
        [EndorsementFieldNames.createdBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [EndorsementFieldNames.createdAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save endorsement', err)
      handleError(err)
    }
  }

  if (!userId) {
    return (
      <Button color="default" className={classes.loggedOutBtn}>
        Log in to endorse ({endorsementCount})
      </Button>
    )
  }

  if (isSaving) {
    return <Button color="default">Saving...</Button>
  }

  if (isSavingError) {
    return <Button disabled>Error</Button>
  }

  if (isSavingSuccess) {
    return <Button disabled>Successfully endorsed ({endorsementCount})</Button>
  }

  if (myEndorsements && myEndorsements.length) {
    return (
      <Button
        color="default"
        className={classes.loggedOutBtn}
        icon={<CheckIcon />}>
        Endorsed ({endorsementCount})
      </Button>
    )
  }

  return (
    <Button color="default" onClick={onSaveBtnClick}>
      Endorse ({endorsementCount})
    </Button>
  )
}
