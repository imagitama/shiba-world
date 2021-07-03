import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import DeleteIcon from '@material-ui/icons/Delete'
import GavelIcon from '@material-ui/icons/Gavel'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import Button from '../../components/button'
import CachedView from '../../components/cached-view'
import CachedViewControls from '../../components/cached-view-controls'
import DiscordServerResults from '../../components/discord-server-results'

import * as routes from '../../routes'
import useIsEditor from '../../hooks/useIsEditor'
import { DiscordServerFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  }
})

const Renderer = ({ items }) => <DiscordServerResults discordServers={items} />

const subViews = {
  PUBLIC: 0,
  DELETED: 1,
  UNAPPROVED: 2
}

export default () => {
  const isEditor = useIsEditor()
  const [selectedSubView, setSelectedSubView] = useState(subViews.PUBLIC)
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Helmet>
        <title>View all Discord servers | VRCArena</title>
        <meta
          name="description"
          content="Browse Discord servers that are related to the species of VRChat."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.discordServers}>Discord Servers</Link>
      </Heading>
      <BodyText>A list of Discord servers.</BodyText>
      {selectedSubView === subViews.UNAPPROVED && (
        <Heading variant="h2">Unapproved</Heading>
      )}
      {selectedSubView === subViews.DELETED && (
        <Heading variant="h2">Deleted</Heading>
      )}
      {isEditor && (
        <CachedViewControls>
          <Button
            onClick={() => setSelectedSubView(subViews.PUBLIC)}
            color="default">
            Reset
          </Button>
          <Button
            onClick={() => setSelectedSubView(subViews.DELETED)}
            icon={<DeleteIcon />}
            color="default">
            Show Deleted
          </Button>
          <Button
            onClick={() => setSelectedSubView(subViews.UNAPPROVED)}
            icon={<GavelIcon />}
            color="default">
            Show Unapproved
          </Button>
          <Button icon={<AddIcon />} url={routes.createDiscordServer}>
            Create
          </Button>
        </CachedViewControls>
      )}
      <CachedView
        viewName={`view-discord-servers${
          selectedSubView === subViews.DELETED
            ? '_isDeleted'
            : selectedSubView === subViews.UNAPPROVED
            ? '_isUnapproved'
            : ''
        }`}
        sortKey="discord-servers"
        defaultFieldName={DiscordServerFieldNames.name}>
        <Renderer />
      </CachedView>
    </div>
  )
}
