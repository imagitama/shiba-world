import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import EditIcon from '@material-ui/icons/Edit'
import Markdown from 'react-markdown'

import * as routes from '../../routes'
import categoryMeta from '../../category-meta'

import ErrorMessage from '../../components/error-message'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import Heading from '../../components/heading'
import NoResultsMessage from '../../components/no-results-message'
import Button from '../../components/button'
import OwnerEditor from '../../components/owner-editor'
import DiscordServerWidget from '../../components/discord-server-widget'
import SocialMediaList from '../../components/social-media-list'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames,
  AuthorFieldNames
} from '../../hooks/useDatabaseQuery'
import { createRef, canEditAuthor } from '../../utils'
import { trackAction } from '../../analytics'

function AssetsByAuthorId({ authorId }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [
      AssetFieldNames.author,
      Operators.EQUALS,
      createRef(CollectionNames.Authors, authorId)
    ],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get assets by author name</ErrorMessage>
  }

  if (!results.length) {
    return <NoResultsMessage />
  }

  return <AssetResults assets={results} />
}

const useStyles = makeStyles({
  categories: {
    marginTop: '0',
    marginBottom: '1rem',
    fontSize: '150%'
  },
  findMoreAuthorsBtn: {
    marginTop: '3rem',
    textAlign: 'center'
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      width: 'auto',
      height: '1em'
    }
  }
})

function FindMoreAuthorsBtn() {
  const classes = useStyles()

  return (
    <div className={classes.findMoreAuthorsBtn}>
      <Button
        url={routes.authors}
        onClick={() =>
          trackAction('ViewAuthor', 'Click find more authors button')
        }>
        Find More Authors
      </Button>
    </div>
  )
}

const analyticsCategory = 'ViewAuthor'

export default ({
  match: {
    params: { authorId }
  }
}) => {
  const [, , user] = useUserRecord()
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.Authors,
    authorId
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to get author</ErrorMessage>
  }

  if (!result) {
    return <ErrorMessage>The author does not exist</ErrorMessage>
  }

  const {
    [AuthorFieldNames.name]: name,
    [AuthorFieldNames.description]: description,
    [AuthorFieldNames.categories]: categories = [],
    [AuthorFieldNames.discordServerId]: discordServerId,
    [AuthorFieldNames.ownedBy]: ownedBy,
    [AuthorFieldNames.createdBy]: createdBy,
    [AuthorFieldNames.lastModifiedBy]: lastModifiedBy
  } = result

  return (
    <>
      <Helmet>
        <title>View assets created by author {name} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the assets that have been uploaded for the author ${name}.`}
        />
      </Helmet>

      <Heading variant="h1">
        <Link to={routes.viewAuthorWithVar.replace(':authorId', authorId)}>
          {name}
        </Link>
      </Heading>
      <div className={classes.categories}>
        {categories.map((categoryName, idx) => (
          <Fragment key={categoryName}>
            {idx !== 0 && ', '}
            <Link
              key={categoryName}
              to={routes.viewCategoryWithVar.replace(
                ':categoryName',
                categoryName
              )}>
              {categoryMeta[categoryName].name}
            </Link>
          </Fragment>
        ))}
      </div>

      {description && <Markdown source={description} />}

      <SocialMediaList
        socialMedia={result}
        actionCategory={analyticsCategory}
      />

      {discordServerId && (
        <DiscordServerWidget
          serverId={discordServerId}
          joinActionCategory={analyticsCategory}
        />
      )}

      {canEditAuthor(user, result) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.editAuthorWithVar.replace(':authorId', authorId)}
            icon={<EditIcon />}
            onClick={() =>
              trackAction(
                analyticsCategory,
                'Click edit author button',
                authorId
              )
            }>
            Edit
          </Button>{' '}
          <OwnerEditor
            collectionName={CollectionNames.Authors}
            id={authorId}
            actionCategory="ViewAuthor"
          />
        </>
      )}
      <Heading variant="h2">Assets</Heading>
      <AssetsByAuthorId authorId={authorId} />

      <Heading variant="h2">Meta</Heading>
      {ownedBy && (
        <div>
          Owned by{' '}
          <Link to={routes.viewUserWithVar.replace(':userId', ownedBy.id)}>
            {ownedBy.username}
          </Link>
        </div>
      )}

      <div>
        Created by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', createdBy.id)}>
          {createdBy.username}
        </Link>
      </div>

      {lastModifiedBy && (
        <div>
          Last modified by{' '}
          <Link
            to={routes.viewUserWithVar.replace(':userId', lastModifiedBy.id)}>
            {lastModifiedBy.username}
          </Link>
        </div>
      )}

      <FindMoreAuthorsBtn />
    </>
  )
}
