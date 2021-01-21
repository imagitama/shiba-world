import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  SpeciesFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { fixAccessingImagesUsingToken } from '../../utils'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem' },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
    paddingLeft: '4rem'
  },
  item: {
    width: '100px',
    height: '100px',
    position: 'relative',
    margin: '0.5rem 0.5rem 0 -1.5rem',
    clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
    '& a': {
      width: '100%',
      height: '100%',
      display: 'inline'
    },
    '& img': {
      width: '100%'
    },
    transition: 'all 100ms',
    '&:hover': {
      cursor: 'pointer',
      transform: 'scale(1.2)',
      zIndex: 100,
      '& span': {
        opacity: 1
      }
    }
  },
  title: {
    width: '100%',
    position: 'absolute',
    bottom: '44%',
    right: '-30%',
    color: '#FFF',
    textShadow: '0 0 2px #000',
    opacity: 0,
    transition: 'all 100ms',
    transform: 'rotate(-76deg)',
    fontSize: '75%'
  }
})

const Species = ({ id, title, optimizedThumbnailUrl, onClick }) => {
  const classes = useStyles()

  return (
    <div className={classes.item} onClick={() => onClick(id)}>
      <span className={classes.title}>{title}</span>
      <img
        src={fixAccessingImagesUsingToken(optimizedThumbnailUrl)}
        alt={`Thumbnail for species ${title}`}
        className={classes.thumbnail}
      />
    </div>
  )
}

function sortSpeciesByAlpha([speciesNameA], [speciesNameB]) {
  return speciesNameA.localeCompare(speciesNameB)
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

  const allSpecies = results.map(result => [
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

  return (
    <div className={classes.root}>
      <div className={classes.items}>
        {allSpecies
          .sort(sortSpeciesByAlpha)
          .map(
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
                onClick={onSpeciesClick}
              />
            )
          )}
      </div>
    </div>
  )
}
