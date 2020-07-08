import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import * as routes from '../../routes'

import FormattedDate from '../formatted-date'

const useStyles = makeStyles({
  root: {
    marginBottom: '1rem',
    position: 'relative'
  }
})

export default ({ comment: { id, comment, createdBy, createdAt } }) => {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <div className={classes.container} title={id}>
        <CardContent>
          <Typography gutterBottom component="p">
            {comment}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="p">
            <FormattedDate date={createdAt} /> by{' '}
            <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
              {createdBy.username}
            </Link>
          </Typography>
        </CardContent>
      </div>
    </Card>
  )
}
