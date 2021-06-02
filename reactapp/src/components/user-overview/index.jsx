import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import LazyLoad from 'react-lazyload'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators,
  OrderDirections,
  UserFieldNames,
  AuthorFieldNames,
  ProfileFieldNames,
  SpeciesFieldNames,
  options,
  EndorsementFieldNames,
  mapDates
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
import Markdown from '../markdown'
import Award from '../award'

import * as routes from '../../routes'
import { createRef, fixAccessingImagesUsingToken } from '../../utils'
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
    marginTop: '1rem',
    display: 'flex'
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
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '125%',
    '& img': {
      width: '100px',
      marginRight: '1rem'
    }
  },
  favoriteSpeciesHeading: {
    flex: 1
  },
  awards: {
    display: 'flex',
    marginLeft: '0.5rem'
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
    20,
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

const EndorsementsForUser = ({ userId }) => {
  const [, , currentUser] = useUserRecord()

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Endorsements,
    [
      [
        EndorsementFieldNames.createdBy,
        Operators.EQUALS,
        createRef(CollectionNames.Users, userId)
      ]
    ],
    {
      [options.populateRefs]: true,
      [options.limit]: 20,
      [options.orderBy]: [EndorsementFieldNames.createdAt, OrderDirections.DESC]
    }
  )

  if (isLoading || results === null) {
    return <LoadingIndicator />
  }

  const assets = results
    .filter(endorsement => {
      if (endorsement[EndorsementFieldNames.asset][AssetFieldNames.isAdult]) {
        if (currentUser && currentUser.enabledAdultContent === true) {
          return true
        } else {
          return false
        }
      }
      return true
    })
    .map(endorsement => mapDates(endorsement[EndorsementFieldNames.asset]))

  if (isErrored) {
    return <ErrorMessage>Failed to find their endorsements</ErrorMessage>
  }

  if (!assets.length) {
    return <ErrorMessage>No endorsements found</ErrorMessage>
  }

  return <AssetResults assets={assets} showCategory />
}

const Awards = ({ userId }) => {
  const [isLoading, isErrored, result] = useDatabaseQuery(
    CollectionNames.AwardsForUsers,
    userId
  )
  const classes = useStyles()

  if (isLoading || result === null) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load awards</ErrorMessage>
  }

  if (!result) {
    return null
  }

  return (
    <div className={classes.awards}>
      {result.awards.map(awardId => (
        <Award key={awardId} awardId={awardId} />
      ))}
    </div>
  )
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
        <div>
          <Heading variant="h2" className={classes.favoriteSpeciesHeading}>
            Favorite Species
          </Heading>
          <Link
            to={routes.viewSpeciesWithVar.replace(
              ':speciesIdOrSlug',
              favoriteSpecies.id
            )}
            className={classes.favoriteSpecies}>
            <img
              src={fixAccessingImagesUsingToken(
                favoriteSpecies[SpeciesFieldNames.thumbnailUrl]
              )}
              alt="Favorite species icon"
            />
            {favoriteSpecies[SpeciesFieldNames.singularName]}
          </Link>
        </div>
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
        </Link>{' '}
        <Awards userId={userId} />
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
      <LazyLoad>
        <CommentList collectionName={CollectionNames.Users} parentId={userId} />
      </LazyLoad>
      <AddCommentForm
        collectionName={CollectionNames.Users}
        parentId={userId}
        onAddClick={() =>
          trackAction('ViewUser', 'Click add comment button', { userId })
        }
      />
      <Heading variant="h2">Authors</Heading>
      <p>A user can have multiple authors associated with it.</p>
      <LazyLoad>
        <AuthorsForUser userId={userId} />
      </LazyLoad>
      <Heading variant="h2">Most Recent Endorsements</Heading>
      <LazyLoad>
        <EndorsementsForUser userId={userId} />
      </LazyLoad>
      <Heading variant="h2">Most Recent Uploads</Heading>
      <LazyLoad>
        <AssetsForUser userId={userId} />
      </LazyLoad>
    </>
  )
}
