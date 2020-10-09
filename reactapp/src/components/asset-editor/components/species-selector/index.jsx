import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import useDatabaseQuery, {
  CollectionNames,
  SpeciesFieldNames
} from '../../../../hooks/useDatabaseQuery'
import useCategoryMeta from '../../../../hooks/useCategoryMeta'

import Button from '../../../button'
import Heading from '../../../heading'
import LoadingIndicator from '../../../loading-indicator'
import ErrorMessage from '../../../error-message'
import { isRef } from '../../../../utils'

const useStyles = makeStyles({
  doneBtn: {
    marginTop: '1rem',
    textAlign: 'center'
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    width: '50%',
    padding: '0.5rem',
    position: 'relative'
  },
  contentsWrapper: {
    display: 'flex'
  },
  media: {
    width: '200px',
    height: '200px',
    flexShrink: 0
  },
  thumbnail: {
    width: '100%',
    height: '100%'
  },
  content: {
    flex: 1
  },
  // TODO: Invert theme and share components with category selector
  isSelected: {
    backgroundColor: 'grey',
    boxShadow: '0px 0px 10px #FFF'
  }
})

function Item({
  name,
  shortDescription,
  thumbnailUrl,
  optimizedThumbnailUrl,
  onClick,
  isSelected
}) {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <Card className={isSelected ? classes.isSelected : ''}>
        <CardActionArea className={classes.contentsWrapper} onClick={onClick}>
          <div className={classes.media}>
            <picture>
              <source srcSet={optimizedThumbnailUrl} type="image/webp" />
              <source srcSet={thumbnailUrl} type="image/png" />
              <img
                src={thumbnailUrl}
                alt={`Thumbnail for species ${name}`}
                className={classes.thumbnail}
              />
            </picture>
          </div>
          <CardContent className={classes.content}>
            <Typography variant="h5" component="h2">
              {name}
            </Typography>
            <Typography component="p">{shortDescription}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  )
}

export default ({
  selectedCategory,
  onSelect,
  onDeSelect,
  selectedSpeciesMulti,
  onDone
}) => {
  const classes = useStyles()
  const { nameSingular } = useCategoryMeta(selectedCategory)
  const [isLoading, isError, results] = useDatabaseQuery(
    CollectionNames.Species
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return (
    <>
      <Heading variant="h1">Upload {nameSingular}</Heading>
      <Heading variant="h2">Select a species</Heading>
      <p>This is optional - you can select none and click Done.</p>
      <div className={classes.items}>
        {results
          .map(result => [
            result.singularName,
            {
              id: result.id,
              name: result[SpeciesFieldNames.singularName],
              shortDescription: result[SpeciesFieldNames.shortDescription],
              optimizedThumbnailUrl: result[SpeciesFieldNames.thumbnailUrl],
              thumbnailUrl: result[SpeciesFieldNames.fallbackThumbnailurl]
            }
          ])

          .map(([name, meta]) => (
            <Item
              key={name}
              {...meta}
              isSelected={
                selectedSpeciesMulti.findIndex(selectedSpeciesItem => {
                  if (isRef(selectedSpeciesItem)) {
                    return meta.id && selectedSpeciesItem.ref.id === meta.id
                  }
                  return selectedSpeciesItem === name
                }) !== -1
              }
              onClick={() => {
                if (
                  selectedSpeciesMulti.findIndex(selectedSpeciesItem => {
                    if (isRef(selectedSpeciesItem)) {
                      return meta.id && selectedSpeciesItem.ref.id === meta.id
                    }
                    return selectedSpeciesItem === name
                  }) !== -1
                ) {
                  onDeSelect(name, meta.id)
                } else {
                  onSelect(name, meta.id)
                }
              }}
            />
          ))}
      </div>
      <div className={classes.doneBtn}>
        <Button size="large" onClick={() => onDone()}>
          Done
        </Button>
      </div>
    </>
  )
}
