import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'

import defaultAvatarUrl from '../../assets/images/default-avatar.png'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators,
  OrderDirections,
  UserFieldNames
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

function Avatar({ username, url }) {
  const classes = useStyles()

  return (
    <div className={classes.avatar}>
      <img
        src={url || defaultAvatarUrl}
        className={classes.img}
        alt={`Avatar for ${username}`}
      />
    </div>
  )
}

function Profile({ userId }) {
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId
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
    patreonUsername
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
  if (isErroredLoadingUser) {
    return (
      <ErrorMessage>Failed to load their account or user profile</ErrorMessage>
    )
  }

  const {
    [UserFieldNames.username]: username = '',
    [UserFieldNames.isBanned]: isBanned
  } = user

  if (!username) {
    return <ErrorMessage>User does not appear to exist</ErrorMessage>
  }

  return (
    <>
      <Helmet>
        <title>View the assets uploaded by {username} | VRCArena</title>
        <meta
          name="description"
          content={`Browse all of the accessories, animations, avatars, news articles, tutorials and more uploaded by ${username}`}
        />
      </Helmet>
      <Avatar username={user.username} url={user.avatarUrl} />
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
      <Profile userId={userId} />
      <Heading variant="h2">Comments</Heading>
      <CommentList collectionName={CollectionNames.Users} parentId={userId} />
      <AddCommentForm
        collectionName={CollectionNames.Users}
        parentId={userId}
        onAddClick={() =>
          trackAction('ViewUser', 'Click add comment button', { userId })
        }
      />
      <Heading variant="h2">Uploads</Heading>
      <AssetsForUser userId={userId} />
    </>
  )
}
