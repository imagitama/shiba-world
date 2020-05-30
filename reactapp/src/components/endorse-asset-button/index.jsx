import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import useUserRecord from '../../hooks/useUserRecord'
import Button from '../button'
import useDatabaseQuery, {
  CollectionNames,
  EndorsementFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'

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

  const onSaveBtnClick = () => {
    save({
      asset: assetDocument,
      createdBy: userDocument
    })
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
      <Button color="default" className={classes.loggedOutBtn}>
        You have endorsed it ({endorsements.length})
      </Button>
    )
  }

  return (
    <Button onClick={onSaveBtnClick}>Endorse ({endorsements.length})</Button>
  )
}
