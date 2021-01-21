import React, { forwardRef } from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

function getFontSizeForVariant(variant) {
  switch (variant) {
    case 'h1':
      return '3rem'
    case 'h2':
      return '1.5rem'
    case 'h3':
      return '1.25rem'
    default:
      return '1rem'
  }
}

const useStyles = makeStyles({
  heading: ({ variant }) => ({
    fontSize: getFontSizeForVariant(variant),
    margin: '2rem 0 1rem',
    [mediaQueryForTabletsOrBelow]: {
      marginTop: '1rem'
    }
  })
})

export default forwardRef(({ children, variant, className = '', id }, ref) => {
  const classes = useStyles({ variant })

  return (
    <Typography
      variant={variant}
      className={`${classes.heading} ${className}`}
      ref={ref}
      id={id}>
      {children}
    </Typography>
  )
})
