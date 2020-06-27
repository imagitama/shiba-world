import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import useUserRecord from '../../hooks/useUserRecord'
import Button from '../button'
import useDatabaseQuery, {
  CollectionNames,
  EndorsementFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import { trackAction, actions } from '../../analytics'
import { handleError } from '../../error-handling'

const useStyles = makeStyles({
  loggedOutBtn: {
    cursor: 'not-allowed',
    opacity: 1
  }
})

export default ({ assetId }) => {
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [assetDocument] = useDatabaseDocument(CollectionNames.Assets, assetId)
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [
    isFetchingEndorsements,
    isErroredFetchingEndorsements,
    endorsements
  ] = useDatabaseQuery(CollectionNames.Endorsements, [
    [EndorsementFieldNames.asset, Operators.EQUALS, assetDocument]
  ])
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Endorsements
  )
  const classes = useStyles()

  const onSaveBtnClick = async () => {
    try {
      await save({
        asset: assetDocument,
        createdBy: userDocument
      })

      trackAction(actions.ENDORSE_ASSET, {
        assetId,
        userId: user && user.id
      })
    } catch (err) {
      console.error('Failed to save endorsement', err)
      handleError(err)
    }
  }

  if (isLoadingUser || isFetchingEndorsements || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (
    isErroredLoadingUser ||
    isErroredFetchingEndorsements ||
    didSaveSucceedOrFail === false
  ) {
    return <Button disabled>Error</Button>
  }

  if (didSaveSucceedOrFail === true) {
    return (
      <Button disabled>Successfully endorsed ({endorsements.length})</Button>
    )
  }

  if (!user) {
    return (
      <Button color="default" className={classes.loggedOutBtn}>
        Log in to endorse ({endorsements.length})
      </Button>
    )
  }

  if (endorsements.find(({ createdBy }) => createdBy.id === user.id)) {
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
