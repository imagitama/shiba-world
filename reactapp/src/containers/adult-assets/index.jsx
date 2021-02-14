import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'

import * as routes from '../../routes'

import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import NoResultsMessage from '../../components/no-results-message'
import Paper from '../../components/paper'
import Button from '../../components/button'

import { alreadyOver18Key } from '../../config'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import useStorage from '../../hooks/useStorage'
import { trackAction } from '../../analytics'

function Assets() {
  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, true],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ]

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses
  )

  if (isLoading) {
    return <LoadingIndicator message="Loading assets..." />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} showPinned showIsNsfw={false} />
}

const useStyles = makeStyles({
  over18message: {
    padding: '5rem 0',
    textAlign: 'center'
  }
})

export default () => {
  const [, , user] = useUserRecord()
  const [isAdult, setIsAdult] = useState(false)
  const classes = useStyles()
  const [isAlreadyOver18, setIsAlreadyOver18] = useStorage(alreadyOver18Key)

  useEffect(() => {
    if (!user) {
      return
    }

    if (user[UserFieldNames.enabledAdultContent]) {
      setIsAdult(user[UserFieldNames.enabledAdultContent])
    }
  }, [user !== null])

  const onOver18ButtonClick = () => {
    setIsAdult(true)
    setIsAlreadyOver18(true)

    trackAction('Nsfw', 'Click I am over 18 button')
  }

  return (
    <>
      <Helmet>
        <title>View adult assets | VRCArena</title>
        <meta name="description" content="View a list of adult assets" />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.nsfw}>NSFW Content</Link>
      </Heading>
      {isAdult || isAlreadyOver18 ? (
        <Assets />
      ) : (
        <Paper className={classes.over18message}>
          <Heading variant="h2">Over 18 Check</Heading>
          <p>This area requires that you are over the age of 18.</p>
          <Button onClick={onOver18ButtonClick}>
            I am over 18 please show me this content
          </Button>
        </Paper>
      )}
    </>
  )
}
