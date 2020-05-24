import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'

import RecentAssets from '../../components/recent-assets'
import Heading from '../../components/heading'
import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import useSearchTerm from '../../hooks/useSearchTerm'

const useSpeciesStyles = makeStyles({
  root: {
    width: 250,
    margin: '0.5rem'
  },
  media: {
    height: 250
  }
})

const Species = ({ name, title, description, imageUrl }) => {
  const classes = useSpeciesStyles()
  const url = routes.browseWithVar.replace(':tagName', name)

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <Link to={url}>
          <CardMedia
            className={classes.media}
            image={imageUrl}
            title={`Thumbnail for ${name}`}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {title}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {description}
            </Typography>
          </CardContent>
        </Link>
      </CardActionArea>
      <CardActions>
        <Button size="small" color="primary">
          <Link to={url}>Browse</Link>
        </Button>
      </CardActions>
    </Card>
  )
}

const SpeciesBrowser = () => (
  <>
    <Heading variant="h2">Species</Heading>
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {Object.entries(speciesMeta).map(
        ([name, { name: title, shortDescription, thumbnailUrl }]) => (
          <Species
            key={name}
            name={name}
            title={title}
            description={shortDescription}
            imageUrl={thumbnailUrl}
          />
        )
      )}
    </div>
  </>
)

export default () => {
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <SpeciesBrowser />
      <Heading variant="h2">Recent Assets</Heading>
      <RecentAssets />
    </>
  )
}
