import React from 'react'
import { Link } from 'react-router-dom'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'
import * as routes from '../../routes'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0' }
})

export default ({
  tagName,
  isFilled = true,
  isDisabled = false,
  onClick = null,
  icon = null
}) => {
  const classes = useStyles()

  const ChipToRender = () => (
    <Chip
      className={classes.chip}
      label={tagName}
      color={isFilled && !isDisabled ? 'primary' : undefined}
      disabled={isDisabled}
      clickable={!isDisabled}
      onClick={isDisabled !== true ? onClick : undefined}
      icon={icon}
    />
  )

  if (onClick || isDisabled) {
    return <ChipToRender />
  } else {
    return (
      <Link to={routes.tagsWithVar.replace(':tagName', tagName)}>
        <ChipToRender />
      </Link>
    )
  }
}
