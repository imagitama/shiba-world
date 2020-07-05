import React from 'react'
import FormattedDate from '../formatted-date'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

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
            <FormattedDate date={createdAt} /> by {createdBy.username}
          </Typography>
        </CardContent>
      </div>
    </Card>
  )
}
