import React from 'react'
import { makeStyles } from '@material-ui/core'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import { CollectionNames } from '../../hooks/useDatabaseQuery'
import { trackAction, actions } from '../../analytics'
import Button from '../button'

const useStyles = makeStyles({
  loggedOutBtn: {
    cursor: 'not-allowed',
    opacity: 1
  }
})

export default ({ assetId }) => {
  const [isLoadingUser, isErroredLoadingUser, user] = useUserRecord()
  const [userDocument] = useDatabaseDocument(
    CollectionNames.Users,
    user && user.id
  )
  const [isSaving, didSaveSucceedOrFail, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()

  const onApproveBtnClick = async () => {
    try {
      await save({
        isApproved: true,
        lastModifiedBy: userDocument,
        lastModifiedAt: new Date()
      })

      trackAction(actions.APPROVE_ASSET, {
        assetId,
        userId: user && user.id
      })
    } catch (err) {
      console.error('Failed to approve asset', err)
    }
  }

  if (isLoadingUser || isSaving) {
    return <Button color="default">Loading...</Button>
  }

  if (isErroredLoadingUser || didSaveSucceedOrFail === false) {
    return <Button disabled>Error</Button>
  }

  if (didSaveSucceedOrFail === true) {
    return <Button disabled>Successfully approved</Button>
  }

  if (!user) {
    return (
      <Button color="default" className={classes.loggedOutBtn}>
        Log in to approve
      </Button>
    )
  }

  return (
    <Button color="default" onClick={onApproveBtnClick}>
      Approve
    </Button>
  )
}
