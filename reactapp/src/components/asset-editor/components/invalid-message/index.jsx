import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { AssetFieldNames } from '../../../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  hint: { color: 'red', fontWeight: 'bold', margin: '1rem 0' }
})

function getFormInvalidMessage(fieldData) {
  if (!fieldData[AssetFieldNames.title]) {
    return 'You must enter a title'
  }
  if (!fieldData[AssetFieldNames.description]) {
    return 'You must enter a description'
  }
  if (!fieldData[AssetFieldNames.category]) {
    return 'You must select a category'
  }
  if (!fieldData[AssetFieldNames.thumbnailUrl]) {
    return 'You must upload a thumbnail'
  }
  return false
}

export default ({ fieldData }) => {
  const classes = useStyles()

  const message = getFormInvalidMessage(fieldData)

  if (!message) {
    return null
  }

  return <div className={classes.hint}>{message}</div>
}
