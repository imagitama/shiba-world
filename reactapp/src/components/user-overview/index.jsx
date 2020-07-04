import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import TwitterIcon from '@material-ui/icons/Twitter'
import TelegramIcon from '@material-ui/icons/Telegram'
import YouTubeIcon from '@material-ui/icons/YouTube'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'

import { ReactComponent as DiscordIcon } from '../../assets/images/icons/discord.svg'
import { ReactComponent as VrChatIcon } from '../../assets/images/icons/vrchat.svg'
import { ReactComponent as TwitchIcon } from '../../assets/images/icons/twitch.svg'
import defaultAvatarUrl from '../../assets/images/default-avatar.png'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useDatabaseDocument from '../../hooks/useDatabaseDocument'
import useUserRecord from '../../hooks/useUserRecord'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Heading from '../heading'
import AssetResults from '../asset-results'
import Message from '../message'

import * as routes from '../../routes'

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
  }
})

const AssetsForUser = ({ userId }) => {
  const [, , currentUser] = useUserRecord()
  const [userDocument] = useDatabaseDocument(CollectionNames.Users, userId)

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.isDeleted, Operators.EQUALS, false],
    [AssetFieldNames.createdBy, Operators.EQUALS, userDocument]
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
    userDocument ? whereClauses : false
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

function SocialMediaLink({ icon: Icon, url, label }) {
  const classes = useStyles()

  const FinalIcon = () => (
    <>
      <Icon className={classes.icon} /> {label}
    </>
  )

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.socialMediaItem}>
        <FinalIcon />
      </a>
    )
  }

  return (
    <span className={`${classes.socialMediaItem} ${classes.notUrl}`}>
      <FinalIcon />
    </span>
  )
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
  const [isLoadingUser, isErroredLoadingUser, user] = useDatabaseQuery(
    CollectionNames.Users,
    userId
  )
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId
  )
  const classes = useStyles()

  if (isLoadingUser || isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (isErroredLoadingUser || isErroredLoadingProfile) {
    return (
      <ErrorMessage>Failed to load their account or user profile</ErrorMessage>
    )
  }

  const { username = '' } = user

  if (!username) {
    return <ErrorMessage>User does not appear to exist</ErrorMessage>
  }

  const {
    bio,
    vrchatUsername,
    discordUsername,
    twitterUsername,
    telegramUsername,
    youtubeChannelId,
    twitchUsername
  } = profile

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
      <Heading variant="h1" className={classes.username}>
        <Link to={routes.viewUserWithVar.replace(':userId', userId)}>
          {username}
        </Link>
      </Heading>
      {isStaffMember(user) && <StaffMemberMessage />}
      {bio && (
        <>
          <Heading variant="h2">Bio</Heading>
          <Markdown source={bio} />
        </>
      )}
      {vrchatUsername ||
      discordUsername ||
      twitterUsername ||
      telegramUsername ||
      youtubeChannelId ||
      twitchUsername ? (
        <Heading variant="h2">Social Media</Heading>
      ) : null}
      {vrchatUsername && (
        <SocialMediaLink icon={VrChatIcon} label={vrchatUsername} />
      )}
      {discordUsername && (
        <SocialMediaLink icon={DiscordIcon} label={discordUsername} />
      )}
      {twitterUsername && (
        <SocialMediaLink
          icon={TwitterIcon}
          label={`@${twitterUsername}`}
          url={`https://twitter.com/${twitterUsername}`}
        />
      )}
      {telegramUsername && (
        <SocialMediaLink icon={TelegramIcon} label={`@${telegramUsername}`} />
      )}
      {youtubeChannelId && (
        <SocialMediaLink
          icon={YouTubeIcon}
          label="Channel"
          url={`https://www.youtube.com/channel/${youtubeChannelId}`}
        />
      )}
      {twitchUsername && (
        <SocialMediaLink
          icon={TwitchIcon}
          label={twitchUsername}
          url={`https://twitch.tv/${twitchUsername}`}
        />
      )}
      <Heading variant="h2">Uploads</Heading>
      <AssetsForUser userId={userId} />
    </>
  )
}
