import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import * as routes from '../../routes'

const useStyles = makeStyles({
  root: {
    margin: '1rem',
    position: 'relative'
  },
  container: {
    display: 'flex'
  },
  media: {
    width: 200,
    height: 200,
    flex: 'none'
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    right: 0
  }
})

export default ({
  hit: { objectID: id, title, description, thumbnailUrl, slug }
}) => {
  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={routes.viewAssetWithVar.replace(':assetId', slug || id)}>
          <div className={classes.container}>
            <CardMedia
              className={classes.media}
              image={thumbnailUrl}
              title={`Thumbnail for ${title}`}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {description}
              </Typography>
            </CardContent>
          </div>
        </Link>
      </CardActionArea>
    </Card>
  )
}
