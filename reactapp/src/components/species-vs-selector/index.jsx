import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'
import { Link } from 'react-router-dom'

import useDatabaseQuery, {
  SpeciesFieldNames,
  CollectionNames
} from '../../hooks/useDatabaseQuery'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import { fixAccessingImagesUsingToken } from '../../utils'
import * as routes from '../../routes'

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
    },
    opacity: 1
  },
  title: {
    width: '100%',
    position: 'absolute',
    bottom: '44%',
    right: '-30%',
    color: '#FFF',
    textShadow: '0 0 2px #000',
    transition: 'all 100ms',
    transform: 'rotate(-76deg)',
    fontSize: '75%'
  },
  selectedIcon: {
    background: '#FFF',
    color: '#000',
    borderRadius: '100%',
    padding: '0.5rem',
    position: 'absolute',
    top: '4px',
    left: '25px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unselected: {
    opacity: '0.4',
    '&:hover': {
      opacity: 1
    }
  }
})

const Species = ({
  id,
  title,
  optimizedThumbnailUrl,
  onClick,
  isSelected = false,
  showUnselected = false
}) => {
  const classes = useStyles()

  const ChildToRender = () => (
    <>
      <span className={classes.title}>{title}</span>
      <img
        src={fixAccessingImagesUsingToken(optimizedThumbnailUrl)}
        alt={`Thumbnail for species ${title}`}
        className={classes.thumbnail}
      />
      {!showUnselected && isSelected && (
        <div className={classes.selectedIcon}>
          <CheckIcon />
        </div>
      )}
    </>
  )

  if (onClick) {
    return (
      <div
        className={`${classes.item} ${
          showUnselected && !isSelected ? classes.unselected : ''
        }`}
        onClick={() => onClick(id)}>
        <ChildToRender />
      </div>
    )
  } else {
    return (
      <Link
        className={`${classes.item}  ${
          showUnselected && !isSelected ? classes.unselected : ''
        }`}
        to={routes.viewSpeciesWithVar.replace(':speciesIdOrSlug', id)}>
        <ChildToRender />
      </Link>
    )
  }
}

function sortSpeciesByAlpha([speciesNameA], [speciesNameB]) {
  return speciesNameA.localeCompare(speciesNameB)
}

export default ({
  species = null,
  selectedSpeciesIds = [],
  showUnselected = false,
  onSpeciesClick = null
}) => {
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Species,
    species ? false : undefined // let the parent provide species to save a query
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage />
  }

  const allSpecies = (species || results).map(result => [
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
                isSelected={selectedSpeciesIds.includes(id)}
                showUnselected={showUnselected}
              />
            )
          )}
      </div>
    </div>
  )
}
