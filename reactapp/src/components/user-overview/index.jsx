import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators,
  OrderDirections,
  UserFieldNames,
  AuthorFieldNames,
  ProfileFieldNames,
  SpeciesFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import AssetResults from '../asset-results'
import Message from '../message'
import CommentList from '../comment-list'
import AddCommentForm from '../add-comment-form'
import SocialMediaList from '../social-media-list'
import Button from '../button'
import AuthorResults from '../author-results'
import Avatar from '../avatar'
import Pedestal from '../pedestal'

import * as routes from '../../routes'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import { canEditUsers } from '../../permissions'

const useStyles = makeStyles({
  socialMediaItem: {
    display: 'block',
    padding: '0.5rem'
  },
  notUrl: {
    cursor: 'default'
  },
  icon: {
    verticalAlign: 'middle',
    width: 'auto',
    height: '1em'
  },
  avatar: {
    width: '200px',
    height: '200px'
  },
  img: {
    width: '100%',
    height: '100%'
  },
  username: {
    marginTop: '1rem'
  },
  bio: {
    '& img': {
      maxWidth: '100%'
    }
  },
  isBanned: {
    textDecoration: 'line-through'
  },
  favoriteSpecies: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '125%',
    '& img': {
      width: '100px',
      marginRight: '1rem'
    }
  }
})

const AssetsForUser = ({ userId }) => {
  const [, , currentUser] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.isPrivate, Operators.EQUALS, false],
    [
      AssetFieldNames.createdBy,
      Operators.EQUALS,
      createRef(CollectionNames.Users, userId)
    ]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to NO adult content just to be sure
  if (currentUser && currentUser.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses,
    100,
    [AssetFieldNames.createdAt, OrderDirections.DESC]
  )

  if (isLoading || results === null) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find their uploaded assets</ErrorMessage>
  }

  if (!results.length) {
    return <ErrorMessage>No uploads found</ErrorMessage>
  }

  return <AssetResults assets={results} showCategory />
}

const AuthorsForUser = ({ userId }) => {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Authors,
    [
      [
        AuthorFieldNames.ownedBy,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ]
  )

  if (isLoading || results === null) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to find their authors</ErrorMessage>
  }

  if (!results.length) {
    return <ErrorMessage>No authors found</ErrorMessage>
  }

  return <AuthorResults authors={results} />
}

function Profile({ userId }) {
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId,
    {
      [options.populateRefs]: true // for fav species
    }
  )
  const classes = useStyles()

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  // Profiles are optional and do not exist until they "set it up" so null check here
  if (isErroredLoadingProfile) {
    return (
      <ErrorMessage>Failed to load their account or user profile</ErrorMessage>
    )
  }

  if (!profile) {
    return 'No profile yet'
  }

  const {
    bio,
    vrchatUsername,
    vrchatUserId,
    discordUsername,
    twitterUsername,
    telegramUsername,
    youtubeChannelId,
    twitchUsername,
    patreonUsername,
    [ProfileFieldNames.favoriteSpecies]: favoriteSpecies
  } = profile

  return (
    <>
      {bio && (
        <>
          <Heading variant="h2">Bio</Heading>
          <div className={classes.bio}>
            <Markdown source={bio} />
          </div>
        </>
      )}
      {favoriteSpecies && (
        <>
          <Heading variant="h2">Favorite Species</Heading>
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              favoriteSpecies.id
            )}
            className={classes.favoriteSpecies}>
            <img
              src={favoriteSpecies[SpeciesFieldNames.thumbnailUrl]}
              alt="Favorite species icon"
            />
            {favoriteSpecies[SpeciesFieldNames.singularName]}
          </Link>
        </>
      )}
      <SocialMediaList
        socialMedia={{
          vrchatUsername: vrchatUsername,
          vrchatUserId: vrchatUserId,
          discordUsername: discordUsername,
          twitterUsername: twitterUsername,
          telegramUsername: telegramUsername,
          youtubeChannelId: youtubeChannelId,
          twitchUsername: twitchUsername,
          patreonUsername: patreonUsername
        }}
        actionCategory="ViewUser"
      />
    </>
  )
}

function StaffMemberMessage() {
  return (
    <Message>
      This user is a staff member. You can contact them using social media (eg.
      Discord or Twitter) to report a problem with the site.
    </Message>
  )
}

function isStaffMember(user) {
  return user.isAdmin || user.isEditor
}

export default ({ userId }) => {
  const [, , currentUser] = useUserRecord()
  const [isLoadingUser, isErroredLoadingUser, user] = useDatabaseQuery(
    CollectionNames.Users,
    userId
  )
  const classes = useStyles()

  if (isLoadingUser) {
    return <LoadingIndicator />
  }

  // Profiles are optional and do not exist until they "set it up" so null check here
  if (isErroredLoadingUser || !user) {
    return (
      <ErrorMessage>Failed to load their account or user profile</ErrorMessage>
    )
  }

  const {
    [UserFieldNames.username]: username = '',
    [UserFieldNames.isBanned]: isBanned,
    [AssetFieldNames.pedestalVideoUrl]: pedestalVideoUrl,
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl
  } = user

  if (!username) {
    return <ErrorMessage>User does not appear to exist</ErrorMessage>
  }

  const PedestalContents = () => (
    <>
      <Heading
        variant="h1"
        className={`${classes.username} ${isBanned ? classes.isBanned : ''}`}>
        <Link to={routes.viewUserWithVar.replace(':userId', userId)}>
          {username}
        </Link>
      </Heading>
      {canEditUsers(currentUser) && (
        <Button url={routes.editUserWithVar.replace(':userId', userId)}>
          Edit User
        </Button>
      )}
      {isStaffMember(user) && <StaffMemberMessage />}
      {}
      <Profile userId={userId} />
    </>
  )

  return (
    <>
      <Helmet>
        <title>View the assets uploaded by {username} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the accessories, animations, avatars, news articles, tutorials and more uploaded by ${username}`}
        />
      </Helmet>
      {pedestalVideoUrl ? (
        <Pedestal
          videoUrl={pedestalVideoUrl}
          fallbackImageUrl={pedestalFallbackImageUrl}>
          <PedestalContents />
        </Pedestal>
      ) : (
        <>
          <Avatar
            username={user.username}
            url={
              user && user[UserFieldNames.avatarUrl]
                ? user[UserFieldNames.avatarUrl]
                : null
            }
          />
          <PedestalContents />
        </>
      )}
      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={CollectionNames.Users} parentId={userId} />
      <AddCommentForm
        collectionName={CollectionNames.Users}
        parentId={userId}
        onAddClick={() =>
          trackAction('ViewUser', 'Click add comment button', { userId })
        }
      />
      <Heading variant="h2">Authors</Heading>
      <p>A user can have multiple authors associated with it.</p>
      <AuthorsForUser userId={userId} />
      <Heading variant="h2">Uploads</Heading>
      <AssetsForUser userId={userId} />
    </>
  )
}
