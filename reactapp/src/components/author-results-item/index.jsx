import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import * as routes from '../../routes'
import {
  mediaQueryForTabletsOrBelow,
  mediaQueryForMobiles
} from '../../media-queries'

const useStyles = makeStyles({
  root: {
    width: '33%',
    padding: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '50%',
      padding: '0.25rem'
    },
    [mediaQueryForMobiles]: {
      width: '100%',
      padding: '0.25rem'
    }
  }
})

export default ({ author: { id, name } }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Card>
        <CardActionArea>
          <Link to={routes.viewAuthorWithVar.replace(':authorId', id)}>
            <CardContent>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
  )
}
