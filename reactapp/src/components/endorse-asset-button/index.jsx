import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  EndorsementFieldNames,
  AssetMetaFieldNames,
  Operators
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

export default ({ assetId, onClick = null }) => {
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
  const [, , assetMeta] = useDatabaseQuery(CollectionNames.AssetMeta, assetId)
  const [isSaving, isSavingSuccess, isSavingError, save] = useDatabaseSave(
    CollectionNames.Endorsements
  )
  const classes = useStyles()

  const endorsementCount = assetMeta
    ? assetMeta[AssetMetaFieldNames.endorsementCount]
    : endorsements
    ? endorsements.length
    : 0

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

  if (isFetchingEndorsements) {
    // TODO: Remove string duplication everywhere
    return <Button color="default">Loading...</Button>
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

  if (isErroredFetchingEndorsements || isSavingError) {
    return <Button disabled>Error</Button>
  }

  if (isSavingSuccess) {
    return <Button disabled>Successfully endorsed ({endorsementCount})</Button>
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
