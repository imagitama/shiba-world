import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button'

export default ({ children, onClick, url, ...props }) => {
  const FinalButton = () => (
    <Button variant="contained" color="primary" onClick={onClick} {...props}>
      {children}
    </Button>
  )

  if (url) {
    return (
      <Link to={url}>
        <FinalButton />
      </Link>
    )
  }

  return <FinalButton />
}
