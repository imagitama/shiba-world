import React from 'react'
import { Link } from 'react-router-dom'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'
import * as routes from '../../routes'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0', cursor: 'pointer' }
})

export default ({ tagName, isFilled = true }) => {
  const classes = useStyles()
  return (
    <Link to={routes.tagsWithVar.replace(':tagName', tagName)}>
      <Chip
        className={classes.chip}
        label={tagName}
        color={isFilled ? 'primary' : undefined}
      />
    </Link>
  )
}
