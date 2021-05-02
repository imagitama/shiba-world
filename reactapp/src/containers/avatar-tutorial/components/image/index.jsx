import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'

const useStyles = makeStyles({
  root: {
    display: 'inline-block',
    '& img': {
      maxWidth: '100%',
      maxHeight: '400px',
      boxShadow: '2px 2px 5px #000'
    }
  },
  blurb: {
    fontStyle: 'italic',
    fontSize: '75%',
    textAlign: 'right'
  }
})

export default ({ blurb, ...props }) => {
  const classes = useStyles()
  return (
    <div className={classes.root}>
      <LazyLoad>
        <a
          href={props.src}
          target="_blank"
          rel="noopener noreferrer"
          title={props.alt}>
          <img {...props} className={classes.img} />
        </a>
      </LazyLoad>
      <div className={classes.blurb}>{blurb || props.alt}</div>
    </div>
  )
}
