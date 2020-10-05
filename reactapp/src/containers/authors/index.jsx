import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank'
import CheckBoxIcon from '@material-ui/icons/CheckBox'
import { makeStyles } from '@material-ui/core/styles'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import AuthorResults from '../../components/author-results'
import NoResultsMessage from '../../components/no-results-message'
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

const useStyles = makeStyles({
  root: {
    position: 'relative'
  },
  toggleOnlyShowOpenCommissionsBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    [mediaQueryForMobiles]: {
      position: 'relative',
      margin: '0.5rem 0'
    }
  }
})

function Authors({ onlyShowOpenCommissions = false }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Authors,
    onlyShowOpenCommissions
      ? [[AuthorFieldNames.isOpenForCommission, Operators.EQUALS, true]]
      : undefined,
    undefined,
    [AuthorFieldNames.name, OrderDirections.ASC]
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get authors</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AuthorResults authors={results} />
}

export default () => {
  const [, , user] = useUserRecord()
  const [onlyShowOpenCommissions, setOnlyShowOpenCommissions] = useState(false)
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
      {canApproveAsset(user) && (
        <Button url={routes.createAuthor}>Create</Button>
      )}
      <Button
        className={classes.toggleOnlyShowOpenCommissionsBtn}
        onClick={() => {
          const newVal = !onlyShowOpenCommissions
          setOnlyShowOpenCommissions(newVal)
          trackAction(
            'AssetsList',
            'Click on only show open commissions button',
            newVal
          )
        }}
        color={onlyShowOpenCommissions ? 'primary' : 'default'}
        icon={
          onlyShowOpenCommissions ? (
            <CheckBoxIcon />
          ) : (
            <CheckBoxOutlineBlankIcon />
          )
        }>
        Filter open for commissions only
      </Button>
      <Authors onlyShowOpenCommissions={onlyShowOpenCommissions} />
    </div>
  )
}
