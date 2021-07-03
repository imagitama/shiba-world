import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles'

import Heading from '../../components/heading'
import Paper from '../../components/paper'
import Button from '../../components/button'
import CachedView from '../../components/cached-view'

import { trackAction } from '../../analytics'
import useIsEditor from '../../hooks/useIsEditor'
import {
  mediaQueryForMobiles,
  mediaQueryForTabletsOrBelow
} from '../../media-queries'
import { SpeciesFieldNames } from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'

const description =
  'Browse all of the content for all of the species of VRChat including accessories, animations, tutorials avatars and more.'
const analyticsCategory = 'ViewAllSpecies'

const useStyles = makeStyles(theme => ({
  items: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  item: {
    padding: '1rem',
    width: '25%',
    textAlign: 'center',
    [mediaQueryForTabletsOrBelow]: {
      width: '33.3%'
    },
    [mediaQueryForMobiles]: {
      width: '50%'
    }
  },
  thumb: {
    width: '50%',
    [mediaQueryForTabletsOrBelow]: {
      width: '100%'
    }
  },
  name: {
    marginTop: '0.5rem',
    fontSize: '150%',
    textAlign: 'center'
  },
  description: {
    marginTop: '0.5rem',
    color: '#FFF'
  }
}))

const Renderer = ({ items }) => {
  const classes = useStyles()
  return (
    <div className={classes.items}>
      {items.map(item => (
        <div key={item} className={classes.item}>
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              item[SpeciesFieldNames.slug] || item.id
            )}>
            <img
              src={item[SpeciesFieldNames.thumbnailUrl]}
              alt="Species thumbnail"
              className={classes.thumb}
            />
            <div className={classes.name}>
              {item[SpeciesFieldNames.pluralName]}
            </div>
            <div className={classes.description}>
              {item[SpeciesFieldNames.shortDescription]}
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}

export default () => {
  const isEditor = useIsEditor()
  return (
    <>
      <Helmet>
        <title>View all of the species in the game VRChat | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.viewAllSpecies}>All Species</Link>
      </Heading>
      <Paper>{description}</Paper>
      {isEditor && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.createSpecies}
            icon={<AddIcon />}
            onClick={() =>
              trackAction(analyticsCategory, 'Click create species button')
            }>
            Create
          </Button>
        </>
      )}
      <CachedView
        sortKey="view-all-species"
        viewName="view-all-species"
        defaultFieldName={SpeciesFieldNames.pluralName}>
        <Renderer />
      </CachedView>
    </>
  )
}
