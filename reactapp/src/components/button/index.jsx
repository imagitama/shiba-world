import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    whiteSpace: 'nowrap'
  },
  icon: {
    marginLeft: '0.5rem',
    display: 'flex', // fix line height issue
    // fix non-Material icons
    '& svg': {
      width: '1em',
      height: '1em'
    }
  },
  tertiary: {
    color: '#FFF',
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.tertiary.dark
    }
  }
}))

export default ({
  children,
  onClick,
  url,
  icon,
  isDisabled,
  className = '',
  openInNewTab = true,
  ...props
}) => {
  const classes = useStyles()

  const FinalButton = () => (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      disabled={isDisabled}
      className={`${classes.root} ${className} ${
        props.color === 'tertiary' ? classes.tertiary : ''
      }`}
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
        <a
          href={url}
          {...(openInNewTab
            ? { target: '_blank', rel: 'noopener noreferrer' }
            : {})}>
          <FinalButton />
        </a>
      )
    }
  }

  return <FinalButton />
}
