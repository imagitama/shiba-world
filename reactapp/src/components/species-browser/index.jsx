import React from 'react'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import * as routes from '../../routes'
import speciesMeta from '../../species-meta'

const useStyles = makeStyles({
  speciesBrowser: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  speciesItem: {
    width: '175px',
    margin: '0.5rem',
    '@media (max-width: 959px)': {
      width: '160px',
      margin: '0.25rem'
    }
  },
  thumbnailWrapper: {
    height: '250px',
    position: 'relative',

    '@media (max-width: 959px)': {
      height: '200px'
    }
  },
  thumbnail: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)'
  },
  comingSoonMsg: {
    color: 'gray',
    alignSelf: 'center',
    paddingLeft: '1rem'
  }
})

const Species = ({
  name,
  title,
  description,
  backupThumbnailUrl,
  optimizedThumbnailUrl
}) => {
  const classes = useStyles()
  const url = routes.viewSpeciesWithVar.replace(':speciesName', name)

  return (
    <Card className={classes.speciesItem}>
      <CardActionArea>
        <Link to={url}>
          <div className={classes.thumbnailWrapper}>
            <picture>
              <source srcSet={optimizedThumbnailUrl} type="image/webp" />
              <source srcSet={backupThumbnailUrl} type="image/png" />
              <img
                src={backupThumbnailUrl}
                alt={`Thumbnail for species ${title}`}
                className={classes.thumbnail}
              />
            </picture>
          </div>
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
    </Card>
  )
}

export default () => {
  const classes = useStyles()
  return (
    <div className={classes.speciesBrowser}>
      {Object.entries(speciesMeta).map(
        ([
          name,
          {
            name: title,
            shortDescription,
            optimizedThumbnailUrl,
            backupThumbnailUrl
          }
        ]) => (
          <Species
            key={name}
            name={name}
            title={title}
            description={shortDescription}
            optimizedThumbnailUrl={optimizedThumbnailUrl}
            backupThumbnailUrl={backupThumbnailUrl}
          />
        )
      )}
      {/* <div className={classes.comingSoonMsg}>More coming soon...</div> */}
    </div>
  )
}
