import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'

import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import AuthorResults from '../../components/author-results'
import Button from '../../components/button'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
  OrderDirections,
  Operators
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import { canApproveAsset } from '../../utils'
import useUserRecord from '../../hooks/useUserRecord'
import { trackAction } from '../../analytics'
import { mediaQueryForMobiles } from '../../media-queries'
import CachedView from '../../components/cached-view'
import CachedViewControls from '../../components/cached-view-controls'

const useStyles = makeStyles({
  root: {
    position: 'relative'
  }
})

const subViews = {
  PUBLIC: 0,
  DELETED: 1,
  OPEN_FOR_COMMISSION: 2
}

const Renderer = ({ items }) => <AuthorResults authors={items} />

export default () => {
  const [, , user] = useUserRecord()
  const [selectedSubView, setSelectedSubView] = useState(subViews.PUBLIC)
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Helmet>
        <title>View all authors | VRCArena</title>
        <meta
          name="description"
          content="Browse all of the authors who have assets on the site."
        />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.authors}>Authors</Link>
      </Heading>
      <BodyText>A list of all authors who have assets on the site.</BodyText>
      {selectedSubView === subViews.DELETED && (
        <Heading variant="h2">Deleted</Heading>
      )}
      {selectedSubView === subViews.OPEN_FOR_COMMISSION && (
        <Heading variant="h2">Open For Commission</Heading>
      )}
      <CachedViewControls>
        {canApproveAsset(user) && (
          <>
            <Button
              onClick={() => setSelectedSubView(subViews.PUBLIC)}
              color="default">
              Reset
            </Button>
            <Button
              icon={<DeleteIcon />}
              onClick={() => setSelectedSubView(subViews.DELETED)}
              color="default">
              Show Deleted
            </Button>
            <Button url={routes.createAuthor} icon={<AddIcon />}>
              Create
            </Button>
          </>
        )}
        <Button
          className={classes.toggleOnlyShowOpenCommissionsBtn}
          onClick={() => {
            const isCurrentlyViewingThem =
              selectedSubView === subViews.OPEN_FOR_COMMISSION
            setSelectedSubView(
              isCurrentlyViewingThem
                ? subViews.PUBLIC
                : subViews.OPEN_FOR_COMMISSION
            )
            trackAction(
              'AssetsList',
              'Click on only show open commissions button',
              !isCurrentlyViewingThem
            )
          }}
          color="default"
          icon={
            selectedSubView === subViews.OPEN_FOR_COMMISSION ? (
              <CheckBoxIcon />
            ) : (
              <CheckBoxOutlineBlankIcon />
            )
          }>
          Open for commissions
        </Button>
      </CachedViewControls>
      <CachedView
        viewName={`authors${
          selectedSubView === subViews.DELETED
            ? '-admin'
            : selectedSubView === subViews.OPEN_FOR_COMMISSION
            ? '-openForCommission'
            : ''
        }`}
        sortKey="authors"
        sortOptions={[
          {
            label: 'Name',
            fieldName: AuthorFieldNames.name
          },
          {
            label: 'Created on',
            fieldName: AuthorFieldNames.createdAt
          }
        ]}
        defaultFieldName={AuthorFieldNames.name}>
        <Renderer />
      </CachedView>
    </div>
  )
}
