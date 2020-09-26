import React from 'react'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

import * as routes from '../../routes'
import speciesMeta, { speciesName } from '../../species-meta'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import useDatabaseQuery, {
  SpeciesFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem' },
  items: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  speciesItem: {
    width: '50%',
    padding: '0.5rem',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%',
      padding: '0.25rem'
    }
  },
  fullWidth: {
    width: '100%'
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
  id = null,
  name,
  title,
  description,
  backupThumbnailUrl,
  optimizedThumbnailUrl,
  onSpeciesClick = null,
  isFullWidth = false
}) => {
  const classes = useStyles()
  const url = routes.viewSpeciesWithVar.replace(':speciesName', id || name)

  return (
    <div
      className={`${classes.speciesItem} ${
        isFullWidth ? classes.fullWidth : ''
      }`}>
      <Card>
        <CardActionArea>
          <Link
            to={url}
            className={classes.contentWrapper}
            onClick={() => {
              if (onSpeciesClick) {
                onSpeciesClick(name)
              }
            }}>
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

export default ({ onSpeciesClick = null }) => {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Species
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage />
  }

  const allSpecies = Object.entries(speciesMeta)
    .filter(([key]) => key !== speciesName.otherSpecies)
    .concat(
      results.map(result => [
        result.singularName,
        {
          id: result.id,
          isPopular: result[SpeciesFieldNames.isPopular],
          name: result[SpeciesFieldNames.singularName],
          shortDescription: result[SpeciesFieldNames.shortDescription],
          optimizedThumbnailUrl: result[SpeciesFieldNames.thumbnailUrl],
          thumbnailUrl: result[SpeciesFieldNames.fallbackThumbnailurl]
        }
      ])
    )
  let popular = []
  let unpopular = []

  // todo: replace with nicer loop later when have time
  allSpecies.forEach(([key, speciesItem]) => {
    if (speciesItem[SpeciesFieldNames.isPopular] || !speciesItem.id) {
      popular = popular.concat([[key, speciesItem]])
    } else {
      unpopular = unpopular.concat([[key, speciesItem]])
    }
  })

  const otherSpecies = speciesMeta[speciesName.otherSpecies]

  return (
    <div className={classes.root}>
      <Heading variant="h2">
        <Link to={routes.viewAllSpecies}>Species</Link>
      </Heading>
      <Heading variant="h3">Popular Species</Heading>
      <div className={classes.items}>
        {popular.map(
          ([
            name,
            {
              id,
              name: title,
              shortDescription,
              optimizedThumbnailUrl,
              backupThumbnailUrl
            }
          ]) => (
            <Species
              key={id || name}
              id={id}
              name={name}
              title={title}
              description={shortDescription}
              optimizedThumbnailUrl={optimizedThumbnailUrl}
              backupThumbnailUrl={backupThumbnailUrl}
              onSpeciesClick={onSpeciesClick}
            />
          )
        )}
      </div>
      <Heading variant="h3">More Species</Heading>
      <div className={classes.items}>
        {unpopular.map(
          ([
            name,
            {
              id,
              name: title,
              shortDescription,
              optimizedThumbnailUrl,
              backupThumbnailUrl
            }
          ]) => (
            <Species
              key={id || name}
              id={id}
              name={name}
              title={title}
              description={shortDescription}
              optimizedThumbnailUrl={optimizedThumbnailUrl}
              backupThumbnailUrl={backupThumbnailUrl}
              onSpeciesClick={onSpeciesClick}
            />
          )
        )}
      </div>
      <Heading variant="h3">Other Species</Heading>
      <div>
        <Species
          name={speciesName.otherSpecies}
          title={otherSpecies.name}
          description={otherSpecies.shortDescription}
          optimizedThumbnailUrl={otherSpecies.optimizedThumbnailUrl}
          backupThumbnailUrl={otherSpecies.backupThumbnailUrl}
          onSpeciesClick={onSpeciesClick}
          isFullWidth
        />
      </div>
    </div>
  )
}
