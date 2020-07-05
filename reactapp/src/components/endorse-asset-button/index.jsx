import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  EndorsementFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { trackAction, actions } from '../../analytics'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  loggedOutBtn: {
    cursor: 'not-allowed',
    opacity: 1
  }
})

export default ({ assetId }) => {
  const userId = useFirebaseUserId()
  const [
    isFetchingEndorsements,
    isErroredFetchingEndorsements,
    endorsements
  ] = useDatabaseQuery(CollectionNames.Endorsements, [
    [
      EndorsementFieldNames.asset,
      Operators.EQUALS,
      createRef(CollectionNames.Assets, assetId)
    ]
  ])
  const [isSaving, isSavingSuccess, isSavingError, save] = useDatabaseSave(
    CollectionNames.Endorsements
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
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

      trackAction(actions.ENDORSE_ASSET, {
        assetId,
        userId
      })
    } catch (err) {
      console.error('Failed to save endorsement', err)
      handleError(err)
    }
  }

  if (isFetchingEndorsements) {
    // TODO: Remove string duplication everywhere
    return <Button color="default">Loading...</Button>
  }

  if (!userId) {
    return (
      <Button color="default" className={classes.loggedOutBtn}>
        Log in to endorse ({endorsements.length})
      </Button>
    )
  }

  if (isSaving) {
    return <Button color="default">Saving...</Button>
  }

  if (isErroredFetchingEndorsements || isSavingError) {
    return <Button disabled>Error</Button>
  }

  if (isSavingSuccess) {
    return (
      <Button disabled>Successfully endorsed ({endorsements.length})</Button>
    )
  }

  if (
    endorsements.find(
      ({ [EndorsementFieldNames.createdBy]: createdBy }) =>
        createdBy.id === userId
    )
  ) {
    return (
      <Button
        color="default"
        className={classes.loggedOutBtn}
        icon={<CheckIcon />}>
        Endorsed ({endorsements.length})
      </Button>
    )
  }

  return (
    <Button color="default" onClick={onSaveBtnClick}>
      Endorse ({endorsements.length})
    </Button>
  )
}
