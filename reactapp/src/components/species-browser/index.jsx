import React from 'react'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'

const useStyles = makeStyles({
  speciesBrowser: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  speciesItem: {
    width: '50%',
    padding: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      padding: '0.25rem'
    }
  },
  contentWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  thumbnailWrapper: {
    width: '100px',
    height: '100px',
    position: 'relative',
    flexShrink: 0
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
  },
  cardContent: {
    marginLeft: '1rem',
    '&, &:last-child': {
      padding: '0'
    }
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
    <div className={classes.speciesItem}>
      <Card>
        <CardActionArea>
          <Link to={url} className={classes.contentWrapper}>
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
            <CardContent classes={{ root: classes.cardContent }}>
              <Typography gutterBottom variant="h5" component="h3">
                {title}
              </Typography>
              <Typography variant="body2" color="textSecondary" component="p">
                {description}
              </Typography>
            </CardContent>
          </Link>
        </CardActionArea>
      </Card>
    </div>
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
    </div>
  )
}
