import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Link } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'

import RecentAssets from '../../components/recent-assets'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'

import * as routes from '../../routes'
import speciesMeta from '../../species-meta'
import categoryMeta from '../../category-meta'
import useSearchTerm from '../../hooks/useSearchTerm'
import { AssetCategories } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  speciesBrowser: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' },
  speciesItem: {
    width: 175,
    margin: '0.5rem'
  },
  thumbnailWrapper: {
    height: 250,
    position: 'relative'
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

const SpeciesBrowser = () => {
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
      <div className={classes.comingSoonMsg}>More coming soon...</div>
    </div>
  )
}

function RecentAssetDescription({ categoryName }) {
  return <BodyText>{categoryMeta[categoryName].shortDescription}</BodyText>
}

export default () => {
  const searchTerm = useSearchTerm()

  if (searchTerm) {
    return null
  }

  return (
    <>
      <Heading variant="h2">Species</Heading>
      <BodyText>
        Select a species to browse their assets, tutorials, avatars and news.
      </BodyText>
      <SpeciesBrowser />
      <Heading variant="h2">Recent News</Heading>
      <RecentAssetDescription categoryName={AssetCategories.article} />
      <RecentAssets limit={5} categoryName={AssetCategories.article} />
      <Heading variant="h2">Recent Accessories</Heading>
      <RecentAssetDescription categoryName={AssetCategories.accessory} />
      <RecentAssets limit={5} categoryName={AssetCategories.accessory} />
      <Heading variant="h2">Recent Animations</Heading>
      <RecentAssetDescription categoryName={AssetCategories.animation} />
      <RecentAssets limit={5} categoryName={AssetCategories.animation} />
      <Heading variant="h2">Recent Tutorials</Heading>
      <RecentAssetDescription categoryName={AssetCategories.tutorial} />
      <RecentAssets limit={5} categoryName={AssetCategories.tutorial} />
      <Heading variant="h2">Avatar Showcase</Heading>
      <RecentAssetDescription categoryName={AssetCategories.showcase} />
      <RecentAssets limit={5} categoryName={AssetCategories.showcase} />
    </>
  )
}
