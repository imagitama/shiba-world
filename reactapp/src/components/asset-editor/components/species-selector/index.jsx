import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'

import speciesMeta from '../../../../species-meta'
import useCategoryMeta from '../../../../hooks/useCategoryMeta'

import Button from '../../../button'
import Heading from '../../../heading'

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

  return (
    <>
      <Heading variant="h1">Upload {nameSingular}</Heading>
      <Heading variant="h2">Select a species</Heading>
      <div className={classes.items}>
        {Object.entries(speciesMeta).map(([name, meta]) => (
          <Item
            key={name}
            {...meta}
            isSelected={selectedSpeciesMulti.includes(name)}
            onClick={() => {
              if (selectedSpeciesMulti.includes(name)) {
                onDeSelect(name)
              } else {
                onSelect(name)
              }
            }}
          />
        ))}
      </div>
      <div className={classes.doneBtn}>
        <Button
          size="large"
          onClick={() => {
            if (!selectedSpeciesMulti.length) {
              return
            }
            onDone()
          }}>
          Done
        </Button>
      </div>
    </>
  )
}