import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import useUserRecord from '../../hooks/useUserRecord'
import TwitterFollowButton from '../twitter-follow-button'
import navItems, {
  canShowMenuItem,
  getLabelForMenuItem
} from '../../navigation'

const useStyles = makeStyles({
  root: {
    marginTop: '2rem',
    flexWrap: 'wrap',
    display: 'flex'
  },
  menuItem: {
    color: '#FFF', // TODO: Get from theme
    '& a': {
      padding: '1rem',
      color: 'inherit'
    },
    '&:first-child a': {
      paddingLeft: '0'
    }
  }
})

export default () => {
  const classes = useStyles()
  const [, , user] = useUserRecord()

  return (
    <div className={classes.root}>
      {navItems
        .filter(navItem => canShowMenuItem(navItem, user))
        .map(({ label, url }) => (
          <div key={url} className={classes.menuItem}>
            <Link to={url}>{getLabelForMenuItem(label)}</Link>
          </div>
        ))}

      <TwitterFollowButton />
    </div>
  )
}
