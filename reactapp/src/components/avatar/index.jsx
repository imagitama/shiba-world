import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'
import LoadingIndicator from '../loading-indicator'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'

export const sizes = {
  TINY: 'tiny',
  SMALL: 'small',
  MEDIUM: 'large'
}

const useStyles = makeStyles({
  container: {
    position: 'relative'
  },
  [sizes.TINY]: {
    width: '50px',
    height: '50px'
  },
  [sizes.SMALL]: {
    width: '100px',
    height: '100px'
  },
  [sizes.MEDIUM]: {
    width: '200px',
    height: '200px'
  },
  image: {
    width: '100%',
    height: '100%'
  }
})

export default ({ url, username = '', size = sizes.MEDIUM }) => {
  const classes = useStyles()
  return (
    <div className={`${classes.container} ${classes[size]}`}>
      <LazyLoad placeholder={<LoadingIndicator />}>
        <img
          src={url ? url : defaultAvatarUrl}
          alt={`Avatar for ${username || 'a user'}`}
          className={classes.image}
        />
      </LazyLoad>
    </div>
  )
}
