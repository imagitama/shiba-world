import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
  icon: {
    marginLeft: '0.5rem',
    display: 'flex', // fix line height issue
    // fix non-Material icons
    '& svg': {
      width: '1em',
      height: '1em'
    }
  }
})

export default ({ children, onClick, url, icon, isDisabled, ...props }) => {
  const classes = useStyles()

  const FinalButton = () => (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      disabled={isDisabled}
      {...props}>
      {children} {icon && <span className={classes.icon}>{icon}</span>}
    </Button>
  )

  if (url) {
    if (url.substr(0, 1) === '/') {
      return (
        <Link to={url}>
          <FinalButton />
        </Link>
      )
    } else {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <FinalButton />
        </a>
      )
    }
  }

  return <FinalButton />
}
